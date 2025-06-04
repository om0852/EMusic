import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../models/User';

export async function GET(req) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ message: 'Email not verified' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
} 