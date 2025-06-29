
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentHandle from '@/models/ContentHandle';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';
import { ROLES } from '@/config/roles';

// GET all content handles
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // Allow any authenticated user to view the handles, as it's on the dashboard
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    await connectDB();
    const handles = await ContentHandle.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ handles });
  } catch (error) {
    console.error('Error fetching content handles:', error);
    return NextResponse.json({ message: 'Error fetching content handles' }, { status: 500 });
  }
}


// POST a new content handle
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 403 });
  }
  
  try {
    await connectDB();
    const body = await request.json();

    const { name, link, description } = body;

    if (!name || !link) {
      return NextResponse.json({ message: 'Name and link are required.' }, { status: 400 });
    }

    const newHandle = new ContentHandle({
        name,
        link,
        description,
    });
    
    await newHandle.save();

    return NextResponse.json({ message: 'Content handle created successfully', handle: newHandle }, { status: 201 });
  } catch (error) {
    console.error('Error creating content handle:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Error creating content handle' }, { status: 500 });
  }
}
