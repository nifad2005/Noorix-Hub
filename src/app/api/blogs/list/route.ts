
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog, { type IBlog } from '@/models/Blog';

const ITEMS_PER_PAGE = 9; // Number of blogs per page

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
      query.title = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search on title
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (tag && tag !== 'All') {
      query.tags = tag; // Assumes tags are stored as an array of strings
    }

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .select({
        title: 1,
        featuredImage: 1,
        category: 1,
        tags: 1,
        createdAt: 1,
        content: { $substrCP: ['$content', 0, 150] }, // Snippet of content
        _id: 1,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use .lean() for better performance as we don't need Mongoose documents

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    // Rename 'content' to 'snippet' for clarity on the client
    const formattedBlogs = blogs.map(blog => ({
      ...blog,
      snippet: blog.content, // content here is already the snippet
      content: undefined, // remove the original content field from the response
    }));


    return NextResponse.json({
      blogs: formattedBlogs,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    if (error instanceof Error) {
        return NextResponse.json({ message: 'Error fetching blogs', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Error fetching blogs', error: 'An unknown error occurred' }, { status: 500 });
  }
}
