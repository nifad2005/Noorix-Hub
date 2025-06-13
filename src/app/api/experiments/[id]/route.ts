
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Experiment from '@/models/Experiment';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid experiment ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const experiment = await Experiment.findById(id);

    if (!experiment) {
      return NextResponse.json({ message: 'Experiment not found' }, { status: 404 });
    }

    return NextResponse.json(experiment);
  } catch (error) {
    console.error('Error fetching experiment:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching experiment', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching experiment', error: 'An unknown error occurred' }, { status: 500 });
  }
}
