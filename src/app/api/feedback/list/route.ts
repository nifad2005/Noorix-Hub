
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Feedback from '@/models/Feedback';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Placeholder for future filtering logic
    // const status = searchParams.get('status');
    // const type = searchParams.get('type');
    // const page = parseInt(searchParams.get('page') || '1', 10);
    // const limit = parseInt(searchParams.get('limit') || '10', 10);

    // const query: any = {};
    // if (status) query.status = status;
    // if (type) query.feedbackType = type;

    // const skip = (page - 1) * limit;

    const feedbackItems = await Feedback.find({})
      .sort({ createdAt: -1 }) // Show newest first
      // .skip(skip)
      // .limit(limit)
      .lean();

    // const totalItems = await Feedback.countDocuments(query);
    // const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      feedbackItems,
      // currentPage: page,
      // totalPages,
      // hasMore: page < totalPages,
    });
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching feedback', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching feedback', error: 'An unknown error occurred' }, { status: 500 });
  }
}
