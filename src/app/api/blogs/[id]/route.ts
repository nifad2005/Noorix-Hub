
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching blog post', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching blog post', error: 'An unknown error occurred' }, { status: 500 });
  }
}
