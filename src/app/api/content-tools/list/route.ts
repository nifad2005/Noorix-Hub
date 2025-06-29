
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentTool from '@/models/ContentTool';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ROLES } from '@/config/roles';
import mongoose from 'mongoose';

// Seed data function - now returns plain JavaScript objects
async function seedInitialTool(userId: string) {
    const initialToolData = {
        title: "AI-Powered Blog Post",
        description: "Generate a complete blog post draft from a simple topic or prompt.",
        href: "/dashboard/content-studio/blog",
        icon: "Edit", // This should be a valid lucide-react icon name
        createdBy: new mongoose.Types.ObjectId(userId)
    };

    // To prevent race conditions or duplicates, check if it already exists
    const existingTool = await ContentTool.findOne({ title: initialToolData.title }).lean();
    if (existingTool) {
        return [existingTool];
    }
    
    const newTool = new ContentTool(initialToolData);
    const savedTool = await newTool.save();
    
    // Using .toObject() is a clean way to convert a Mongoose document to a plain object
    return [savedTool.toObject()];
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    // This page is within the dashboard, so user must be authenticated.
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    try {
        await connectDB();

        let tools = await ContentTool.find({}).sort({ createdAt: 'asc' }).lean();

        // If no tools exist, and user is admin/root, seed the initial one.
        if (tools.length === 0 && (session.user.role === ROLES.ROOT || session.user.role === ROLES.ADMIN)) {
            // The seed function now returns plain objects, so no mapping is needed.
            tools = await seedInitialTool(session.user.id);
        }

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Error fetching content tools:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'Error fetching content tools', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Error fetching content tools', error: 'An unknown error occurred' }, { status: 500 });
    }
}
