
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Feedback from '@/models/Feedback';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ROLES } from '@/config/roles';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  try {
    await connectDB();
    // const { searchParams } = new URL(request.url);
    // Future filtering logic can be added here
    
    const feedbackItems = await Feedback.find({})
      .sort({ createdAt: -1 }) 
      .lean();

    return NextResponse.json({
      feedbackItems,
    });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching feedback', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching feedback', error: 'An unknown error occurred' }, { status: 500 });
  }
}
