import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_fallbackkey',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fallback_secret',
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ success: true, order }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
