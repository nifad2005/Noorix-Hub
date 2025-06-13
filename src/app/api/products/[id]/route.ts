
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching product', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching product', error: 'An unknown error occurred' }, { status: 500 });
  }
}
