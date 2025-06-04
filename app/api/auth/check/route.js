import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../models/User';
import { connectDB } from '@/app/utils/db';

export async function GET(req) {
  try {
    await connectDB(); // Connect to database first

    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      console.log('No token found');
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.userId);
      console.log("Found user:", user ? user._id : 'No user found');

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 401 });
      }

      if (!user.isVerified) {
        return NextResponse.json({ message: 'Email not verified' }, { status: 401 });
      }

      // Return user data without sensitive information
      return NextResponse.json({ 
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      message: 'Authentication failed',
      error: error.message 
    }, { status: 500 });
  }
} 