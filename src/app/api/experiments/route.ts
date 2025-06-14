
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Experiment from '@/models/Experiment';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await connectDB();
    const body = await request.json();

    const tagsArray = body.tags ? body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

    const experimentDataPayload: any = {
        title: body.title,
        description: body.description,
        tryHereLink: body.tryHereLink,
        category: body.category,
        tags: tagsArray,
        createdBy: session.user.id, 
    };
    
    if (body.youtubeVideoLink && body.youtubeVideoLink.trim() !== "") {
      experimentDataPayload.youtubeVideoLink = body.youtubeVideoLink.trim();
    }


    const newExperiment = new Experiment(experimentDataPayload);
    await newExperiment.save();

    return NextResponse.json({ message: 'Experiment created successfully', experiment: newExperiment }, { status: 201 });
  } catch (error) {
    console.error('Error creating experiment:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: 'Validation error creating experiment.', errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error creating experiment', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error creating experiment', error: 'An unknown error occurred' }, { status: 500 });
  }
}

