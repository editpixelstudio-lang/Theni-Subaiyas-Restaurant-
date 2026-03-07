import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
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

    if (event.event === 'order.paid') {
      const { notes } = event.payload.order.entity;
      const mongodbOrderId = notes?.mongodbOrderId;

      if (mongodbOrderId) {
        const updatedOrder = await Order.findByIdAndUpdate(
          mongodbOrderId,
          { 
            paymentStatus: 'Paid',
            status: 'Received' // Ensure status is 'Received' when paid
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log(`Order ${updatedOrder.orderId} marked as Paid via webhook`);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
