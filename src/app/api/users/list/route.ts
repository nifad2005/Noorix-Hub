
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ROLES, ROOT_EMAIL } from "@/config/roles";
import type { User } from 'next-auth'; // Using NextAuth User type which MongoDBAdapter uses

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== ROLES.ROOT) {
    return NextResponse.json({ message: 'Unauthorized. Root access required.' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    // Fetch all users except the ROOT user themselves
    const users = await db.collection<User>('users').find({ email: { $ne: ROOT_EMAIL } }).toArray();
    
    // Sanitize user data before sending - remove sensitive fields if any, although adapter schema is quite minimal
    const sanitizedUsers = users.map(user => ({
        id: user._id.toString(), // Ensure ID is string
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        role: (user as any).role || ROLES.USER, // Assign USER role if not explicitly set
    }));

    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users list:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching users list', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching users list', error: 'An unknown error occurred' }, { status: 500 });
  }
}
