import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_webhook_secret';

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log(`Razorpay Webhook Received: ${event.event}`);

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const entity = event.event === 'order.paid' ? event.payload.order.entity : event.payload.payment.entity;
      const { notes } = entity;
      const mongodbOrderId = notes?.mongodbOrderId;

      console.log(`Processing ${event.event} for MongoID: ${mongodbOrderId}`);

      if (mongodbOrderId) {
        const updatedOrder = await Order.findByIdAndUpdate(
          mongodbOrderId,
          { 
            paymentStatus: 'Paid',
            status: 'Preparing' // Auto-accept: Move to Preparing instantly
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log(`✅ SUCCESS: Order ${updatedOrder.orderId} marked as PAID and PREPARING`);
        } else {
          console.error(`❌ ERROR: Order ${mongodbOrderId} not found in database`);
        }
      } else {
        console.error(`⚠️ WARNING: No mongodbOrderId found in webhook notes`);
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('CRITICAL Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
