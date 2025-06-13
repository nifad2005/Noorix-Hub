
import { NextResponse } from 'next/server';
// import connectDB from '@/lib/db';
// import Contact from '@/models/Contact';
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import mongoose from 'mongoose';

// The POST functionality is removed as per user request.
// The contact page will now be static.

// If you need to re-enable form submissions in the future, you can uncomment the code below
// and restore the form on the contact page.

/*
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  try {
    await connectDB();
    const body = await request.json();

    const { email } = body;

    // Basic validation for email
    if (!email) {
        return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    // More specific validation for email format (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const contactData: any = {
        email,
        subject: "Contact Request via Email", // Default subject
        message: "User provided email for contact.", // Default message
        name: "Guest User", // Default name
    };

    if (session && session.user && session.user.id) {
        contactData.userId = new mongoose.Types.ObjectId(session.user.id);
        if (session.user.name) {
            contactData.name = session.user.name; // Use authenticated user's name
        }
         // Email from session might be more reliable if user is logged in
        if (session.user.email) {
            contactData.email = session.user.email;
        }
    }


    const newContactMessage = new Contact(contactData);
    await newContactMessage.save();

    return NextResponse.json({ message: 'Your contact request has been sent successfully!', contact: newContactMessage }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error submitting contact message', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error submitting contact message', error: 'An unknown error occurred' }, { status: 500 });
  }
}
*/

// Add a GET handler or other methods if needed, otherwise this file can be empty or removed
// if no API functionality is required for `/api/contact` anymore.
// For now, providing a placeholder GET that indicates the change.
export async function GET() {
    return NextResponse.json({ message: 'Contact form submission is disabled. Please use the provided email or social links.' }, { status: 405 });
}
