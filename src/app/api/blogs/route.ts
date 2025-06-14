
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await connectDB();
    const body = await request.json();

    const tagsArray = body.tags ? body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

    const blogDataPayload: any = {
        title: body.title,
        content: body.content,
        category: body.category,
        tags: tagsArray,
        createdBy: session.user.id,
    };

    if (body.featuredImage && body.featuredImage.trim() !== "") {
      blogDataPayload.featuredImage = body.featuredImage.trim();
    }

    const newBlog = new Blog(blogDataPayload);
    await newBlog.save();

    return NextResponse.json({ message: 'Blog post created successfully', blog: newBlog }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error creating blog post.', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error creating blog post', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error creating blog post', error: 'An unknown error occurred' }, { status: 500 });
  }
}

