
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    const tags = await Product.distinct('tags');
    return NextResponse.json(tags.filter(tag => tag));
  } catch (error) {
    console.error('Error fetching distinct product tags:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching distinct product tags', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching distinct product tags', error: 'An unknown error occurred' }, { status: 500 });
  }
}
