
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Feedback from '@/models/Feedback';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to view your feedback.' }, { status: 401 });
  }

  try {
    await connectDB();

    const userFeedback = await Feedback.find({ userId: new mongoose.Types.ObjectId(session.user.id) })
      .sort({ createdAt: -1 }) // Show newest first
      .lean();

    return NextResponse.json(userFeedback);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching user feedback', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching user feedback', error: 'An unknown error occurred' }, { status: 500 });
  }
}
