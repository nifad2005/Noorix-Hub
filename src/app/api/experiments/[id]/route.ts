
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Experiment from '@/models/Experiment';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ROLES } from '@/config/roles';

// GET is public
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid experiment ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const experiment = await Experiment.findById(id).lean();

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid experiment ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const body = await request.json();
    
    const tagsArray = body.tags ? body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
    
    const updatedExperimentData = {
      ...body,
      tags: tagsArray,
      updatedAt: new Date(),
    };

    const experiment = await Experiment.findByIdAndUpdate(id, updatedExperimentData, { new: true, runValidators: true });

    if (!experiment) {
      return NextResponse.json({ message: 'Experiment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Experiment updated successfully', experiment });
  } catch (error) {
    console.error('Error updating experiment:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error updating experiment', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error updating experiment', error: 'An unknown error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid experiment ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const experiment = await Experiment.findByIdAndDelete(id);

    if (!experiment) {
      return NextResponse.json({ message: 'Experiment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Experiment deleted successfully' });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error deleting experiment', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error deleting experiment', error: 'An unknown error occurred' }, { status: 500 });
  }
}
