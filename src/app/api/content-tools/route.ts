
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentTool from '@/models/ContentTool';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';
import { ROLES } from '@/config/roles';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || 
      (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }
  
  try {
    await connectDB();
    const body = await request.json();

    const { title, description, href, icon } = body;

    const newTool = new ContentTool({
        title,
        description,
        href,
        icon,
        createdBy: session.user.id,
    });
    
    await newTool.save();

    return NextResponse.json({ message: 'Content tool created successfully', tool: newTool }, { status: 201 });
  } catch (error) {
    console.error('Error creating content tool:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error creating tool.', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error creating tool', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error creating tool', error: 'An unknown error occurred' }, { status: 500 });
  }
}
