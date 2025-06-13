
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Experiment from '@/models/Experiment';

const ITEMS_PER_PAGE = 9;

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || ITEMS_PER_PAGE.toString(), 10);
    const searchTerm = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    const query: any = {};

    if (searchTerm) {
      query.title = { $regex: searchTerm, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (tag && tag !== 'All') {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;

    const experiments = await Experiment.find(query)
      .select({
        title: 1,
        description: { $substrCP: ['$description', 0, 150] }, // Snippet
        category: 1,
        tags: 1,
        createdAt: 1,
        _id: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalExperiments = await Experiment.countDocuments(query);
    const totalPages = Math.ceil(totalExperiments / limit);
    
    const formattedExperiments = experiments.map(exp => ({
      ...exp,
      snippet: exp.description, // Rename for client consistency
      description: undefined,
    }));

    return NextResponse.json({
      experiments: formattedExperiments,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching experiments', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching experiments', error: 'An unknown error occurred' }, { status: 500 });
  }
}
