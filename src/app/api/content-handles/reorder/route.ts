
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentHandle from '@/models/ContentHandle';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ROLES } from '@/config/roles';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user.role !== ROLES.ROOT && session.user.role !== ROLES.ADMIN)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { orderedIds } = await request.json() as { orderedIds: string[] };
    
    if (!Array.isArray(orderedIds)) {
        return NextResponse.json({ message: 'Invalid request body, expected orderedIds array.' }, { status: 400 });
    }

    const updates = orderedIds.map((id, index) => 
      ContentHandle.updateOne({ _id: id }, { $set: { position: index } })
    );

    await Promise.all(updates);

    return NextResponse.json({ message: 'Handles reordered successfully' });
  } catch (error) {
    console.error('[API PUT /api/content-handles/reorder] Error reordering handles:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error reordering handles', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}
