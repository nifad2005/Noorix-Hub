
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Experiment from '@/models/Experiment';

export async function GET() {
  try {
    await connectDB();
    const tags = await Experiment.distinct('tags');
    return NextResponse.json(tags.filter(tag => tag));
  } catch (error) {
    console.error('Error fetching distinct experiment tags:', error);
     if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching distinct experiment tags', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching distinct experiment tags', error: 'An unknown error occurred' }, { status: 500 });
  }
}
