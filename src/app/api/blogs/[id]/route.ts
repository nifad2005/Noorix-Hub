
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ROLES } from '@/config/roles';

// GET is public, no auth needed to read a blog post
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  console.log(`[API GET /api/blogs/:id] Received request for ID: ${id}`);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(`[API GET /api/blogs/:id] Invalid blog ID format: ${id}`);
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  try {
    // This logic should remain as it's for the public-facing detail page.
    await connectDB();
    const blogPost = await Blog.findById(id).lean(); // Using .lean() for direct DB call in page.tsx

    if (!blogPost) {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }
    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(`[API GET /api/blogs/:id] Error fetching blog post for ID: ${id}. Error:`, error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching blog post', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching blog post', error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const tagsArray = body.tags ? String(body.tags).split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

    const updatedBlogData = {
      ...body,
      tags: tagsArray,
      updatedAt: new Date(),
    };

    const blog = await Blog.findByIdAndUpdate(id, updatedBlogData, { new: true, runValidators: true });

    if (!blog) {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Blog post updated successfully', blog });
  } catch (error) {
    console.error('[API PUT /api/blogs/:id] Error updating blog post:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error updating blog post', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error updating blog post', error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid blog ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json({ message: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('[API DELETE /api/blogs/:id] Error deleting blog post:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error deleting blog post', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error deleting blog post', error: 'An unknown error occurred' }, { status: 500 });
  }
}
