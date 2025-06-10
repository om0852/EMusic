import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import User from '@/app/models/User';
import Batch from '@/app/models/Batch';
import Level from '@/app/models/Level'
import Subject from '@/app/models/Subject';
// Add logging to check environment variables
//console.log('RAZORPAY_KEY_ID exists:', !!process.env.RAZORPAY_KEY_ID);
//console.log('RAZORPAY_KEY_SECRET exists:', !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR' } = body;

    // Log the request data
    //console.log('Creating Razorpay order:', { amount, currency });

    const options = {
      amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    // Log successful order creation
    //console.log('Razorpay order created:', order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Error creating Razorpay order:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to create payment order', details: error.message },
      { status: 500 }
    );
  }
} 