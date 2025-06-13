
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET() {
  try {
    await connectDB();
    const tags = await Blog.distinct('tags');
    return NextResponse.json(tags.filter(tag => tag)); // Filter out any null/empty tags
  } catch (error) {
    console.error('Error fetching distinct tags:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching distinct tags', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching distinct tags', error: 'An unknown error occurred' }, { status: 500 });
  }
}
