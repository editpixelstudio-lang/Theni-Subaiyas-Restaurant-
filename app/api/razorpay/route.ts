import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallbackkey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
});

export async function POST(req: Request) {
  try {
    const { amount, orderId } = await req.json();
    console.log(`Creating Razorpay order for: ${amount}, MongoID: ${orderId}`);

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        mongodbOrderId: orderId
      }
    };

    const order = await razorpay.orders.create(options);
    console.log(`Razorpay Order created: ${order.id}`);
    
    return NextResponse.json({ 
      success: true, 
      order, 
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallbackkey' 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create Razorpay order' 
    }, { status: 500 });
  }
}
