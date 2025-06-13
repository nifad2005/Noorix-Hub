
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Feedback from '@/models/Feedback';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || !session.user.name || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized. Please log in to submit feedback.' }, { status: 401 });
  }
  
  try {
    await connectDB();
    const body = await request.json();

    const { feedbackType, subject, message, userId, nameAtSubmission, emailAtSubmission } = body;

    // Basic validation
    if (!feedbackType || !subject || !message || !userId || !nameAtSubmission || !emailAtSubmission) {
        return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }
    if (userId !== session.user.id) {
        return NextResponse.json({ message: 'User ID mismatch.' }, { status: 403 });
    }


    const newFeedbackData = {
        userId: new mongoose.Types.ObjectId(session.user.id),
        nameAtSubmission: session.user.name,
        emailAtSubmission: session.user.email,
        feedbackType,
        subject,
        message,
        status: "New", // Default status
    };

    const newFeedbackItem = new Feedback(newFeedbackData);
    await newFeedbackItem.save();

    return NextResponse.json({ message: 'Feedback submitted successfully', feedback: newFeedbackItem }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error submitting feedback', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error submitting feedback', error: 'An unknown error occurred' }, { status: 500 });
  }
}

