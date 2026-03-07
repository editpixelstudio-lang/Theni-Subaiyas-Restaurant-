import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function GET() {
  await dbConnect();
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    // Simulate unique Order ID
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    
    const newOrder = new Order({
      ...body,
      orderId,
      status: 'Received'
    });
    const savedOrder = await newOrder.save();
    
    // Stubbed WhatsApp Notification Service
    console.log(`\n================= WHATSAPP NOTIFICATION =================`);
    console.log(`Sending WhatsApp to User...`);
    console.log(`Message:`);
    console.log(`Hello! Your order #${orderId} from Theni Subaiyas Restaurant is confirmed.`);
    console.log(`Table: ${body.tableNumber}`);
    console.log(`Total: ₹${body.totalAmount}`);
    console.log(`Track your order instantly: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu/track/${savedOrder._id}`);
    console.log(`=========================================================\n`);

    return NextResponse.json({ success: true, order: savedOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}
