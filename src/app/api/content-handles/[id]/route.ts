
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentHandle from '@/models/ContentHandle';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';
import { ROLES } from '@/config/roles';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized. Admin or Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid handle ID' }, { status: 400 });
  }

  try {
    await connectDB();
    const handle = await ContentHandle.findByIdAndDelete(id);

    if (!handle) {
      return NextResponse.json({ message: 'Content handle not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Content handle deleted successfully' });
  } catch (error) {
    console.error('[API DELETE /api/content-handles/:id] Error deleting handle:', error);
    return NextResponse.json({ message: 'Error deleting content handle' }, { status: 500 });
  }
}
