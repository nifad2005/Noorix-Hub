
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Feedback, { type IFeedback } from '@/models/Feedback';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';
import { ROLES } from '@/config/roles';

// GET a single feedback item by ID (for admin/root)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid feedback ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const feedbackItem = await Feedback.findById(id).lean();

    if (!feedbackItem) {
      return NextResponse.json({ message: 'Feedback item not found' }, { status: 404 });
    }

    return NextResponse.json(feedbackItem);
  } catch (error) {
    console.error('Error fetching feedback item:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching feedback item', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching feedback item', error: 'An unknown error occurred' }, { status: 500 });
  }
}


// PUT (update) a feedback item (for admin/root to respond and change status)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid feedback ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { adminResponse, status } = body;

    if (status && !["New", "In Progress", "Resolved", "Closed"].includes(status)) {
        return NextResponse.json({ message: 'Invalid status value.' }, { status: 400 });
    }

    const updateData: Partial<Pick<IFeedback, 'adminResponse' | 'status' | 'updatedAt'>> = {};
    if (adminResponse !== undefined) updateData.adminResponse = adminResponse.trim();
    if (status) updateData.status = status;
    
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }
    updateData.updatedAt = new Date();


    const updatedFeedbackItem = await Feedback.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedFeedbackItem) {
      return NextResponse.json({ message: 'Feedback item not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Feedback updated successfully', feedback: updatedFeedbackItem });
  } catch (error) {
    console.error('Error updating feedback item:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error updating feedback item', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error updating feedback item', error: 'An unknown error occurred' }, { status: 500 });
  }
}

// DELETE a feedback item (for admin/root)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid feedback ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return NextResponse.json({ message: 'Feedback item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Feedback item deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback item:', error);
     if (error instanceof Error) {
        return NextResponse.json({ message: 'Error deleting feedback item', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error deleting feedback item', error: 'An unknown error occurred' }, { status: 500 });
  }
}
