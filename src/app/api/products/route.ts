
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    
    // Convert comma-separated tags string to an array
    const tagsArray = body.tags ? body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

    const newProductData = {
      ...body,
      tags: tagsArray,
    };

    const newProduct = new Product(newProductData);
    await newProduct.save();

    return NextResponse.json({ message: 'Product created successfully', product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error creating product', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error creating product', error: 'An unknown error occurred' }, { status: 500 });
  }
}
