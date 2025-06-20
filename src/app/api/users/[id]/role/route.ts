
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ROLES, ROOT_EMAIL, type UserRole } from "@/config/roles";
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== ROLES.ROOT) {
    return NextResponse.json({ message: 'Unauthorized. Root access required.' }, { status: 401 });
  }

  const { id } = params;
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { role } = body as { role: UserRole };

    if (!role || (role !== ROLES.ADMIN && role !== ROLES.USER)) {
      return NextResponse.json({ message: 'Invalid role specified. Must be ADMIN or USER.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const userToUpdate = await db.collection('users').findOne({ _id: new ObjectId(id) });
    if (!userToUpdate) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (userToUpdate.email === ROOT_EMAIL) {
        return NextResponse.json({ message: 'Cannot change the role of the ROOT user.' }, { status: 403 });
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: role } }
    );

    if (result.modifiedCount === 0 && result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found or role not changed' }, { status: 404 });
    }
     if (result.modifiedCount === 0 && result.matchedCount > 0) {
      return NextResponse.json({ message: 'User role is already set to this value.', user: {...userToUpdate, role} }, { status: 200 });
    }


    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error updating user role', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error updating user role', error: 'An unknown error occurred' }, { status: 500 });
  }
}
