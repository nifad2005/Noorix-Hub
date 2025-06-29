
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentHandle from '@/models/ContentHandle';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';
import { ROLES } from '@/config/roles';

// DELETE a content handle
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 403 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid handle ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedHandle = await ContentHandle.findByIdAndDelete(id);

    if (!deletedHandle) {
      return NextResponse.json({ message: 'Content handle not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Content handle deleted successfully' });
  } catch (error) {
    console.error('Error deleting content handle:', error);
    return NextResponse.json({ message: 'Error deleting content handle' }, { status: 500 });
  }
}
