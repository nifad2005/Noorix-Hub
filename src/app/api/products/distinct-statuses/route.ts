
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    const statuses = await Product.distinct('status');
    return NextResponse.json(statuses.filter(status => status));
  } catch (error) {
    console.error('Error fetching distinct product statuses:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching distinct product statuses', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching distinct product statuses', error: 'An unknown error occurred' }, { status: 500 });
  }
}
