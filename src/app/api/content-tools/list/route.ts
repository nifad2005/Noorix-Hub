
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContentTool from '@/models/ContentTool';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ROLES } from '@/config/roles';
import mongoose from 'mongoose';

// Seed data function
async function seedInitialTool(userId: string) {
    const initialTool = {
        title: "AI-Powered Blog Post",
        description: "Generate a complete blog post draft from a simple topic or prompt.",
        href: "/dashboard/content-studio/blog",
        icon: "Edit",
        createdBy: new mongoose.Types.ObjectId(userId)
    };
    const newTool = new ContentTool(initialTool);
    await newTool.save();
    return [newTool];
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

        // If no tools exist, seed the initial one for the current user (if admin/root).
        if (tools.length === 0 && (session.user.role === ROLES.ROOT || session.user.role === ROLES.ADMIN)) {
            const seededTools = await seedInitialTool(session.user.id);
            tools = seededTools.map(t => JSON.parse(JSON.stringify(t))); // convert to plain objects
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
