
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentHandle from '@/models/ContentHandle';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';
import { ROLES } from '@/config/roles';

// GET all content handles for the logged-in admin/root
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id ||
      (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  try {
    await connectDB();
    // Fetch handles created by any admin or root user
    const handles = await ContentHandle.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(handles);
  } catch (error) {
    console.error('[API GET /api/content-handles] Error fetching handles:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching content handles', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching content handles' }, { status: 500 });
  }
}


// POST a new content handle
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id ||
      (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const { name, link, description } = body;

    if (!name || !link) {
      return NextResponse.json({ message: 'Name and Link are required.' }, { status: 400 });
    }

    const newHandle = new ContentHandle({
      name,
      link,
      description,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });

    await newHandle.save();

    return NextResponse.json({ message: 'Content handle created successfully', handle: newHandle }, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/content-handles] Error creating handle:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error creating content handle', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error creating content handle' }, { status: 500 });
  }
}
