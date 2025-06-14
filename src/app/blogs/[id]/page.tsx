
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IBlog } from "@/models/Blog";
import connectDB from "@/lib/db"; // Import connectDB
import BlogModel from "@/models/Blog"; // Import Mongoose model
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

async function getBlog(id: string): Promise<IBlog | null> {
  console.log(`[getBlog DB] Received ID: ${id}`);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(`[getBlog DB] Invalid blog ID format: ${id}. Returning null.`);
    return null; // Will lead to notFound()
  }

  try {
    await connectDB();
    console.log(`[getBlog DB] DB connected. Searching for blog with ID: ${id}`);
    // Lean query for performance, and convert to plain JS object
    const blogPost = await BlogModel.findById(id).lean<IBlog>();

    if (!blogPost) {
      console.log(`[getBlog DB] Blog post not found in DB for ID: ${id}. Returning null.`);
      return null; // Will lead to notFound()
    }

    // Convert ObjectId and other Mongoose types to strings if necessary for serialization
    // .lean() usually handles this, but good to be aware
    // For example, if createdBy was populated and you needed its string ID:
    // if (blogPost.createdBy && typeof blogPost.createdBy !== 'string') {
    //   blogPost.createdBy = blogPost.createdBy.toString();
    // }

    console.log(`[getBlog DB] Blog post found for ID: ${id}. Title: ${blogPost.title}`);
    return JSON.parse(JSON.stringify(blogPost)) as IBlog; // Ensure plain object
  } catch (error) {
    console.error(`[getBlog DB] Error fetching blog post for ID: ${id}. Error:`, error);
    // For database errors or other unexpected issues, throw to trigger error.js
    throw new Error(`Error fetching blog post from database: ${(error as Error).message}`);
  }
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  console.log(`[BlogDetailPage] Rendering for blog ID: ${params.id}`);
  let blog: IBlog | null = null;
  try {
    blog = await getBlog(params.id);
  } catch (error) {
    console.error(`[BlogDetailPage] Error caught while calling getBlog for ID ${params.id}:`, error);
    // If getBlog throws an error, Next.js will catch it and render the nearest error.js
    // or its default error page. We re-throw it to ensure this happens.
    throw error;
  }

  if (!blog) {
    console.log(`[BlogDetailPage] Blog data not found for ID ${params.id}, calling notFound().`);
    notFound();
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <PageWrapper>
      <article className="max-w-3xl mx-auto">
        <Card className="shadow-xl overflow-hidden">
          {blog.featuredImage && (
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                data-ai-hint="article header"
              />
            </div>
          )}
          <CardHeader className="space-y-3 p-6">
            <Badge variant="secondary" className="text-sm uppercase w-fit">{blog.category}</Badge>
            <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">
              {blog.title}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Published on {formattedDate}</span>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div
              className="prose prose-lg max-w-none dark:prose-invert text-foreground text-base md:text-lg leading-relaxed whitespace-pre-wrap"
            >
              {blog.content}
            </div>
          </CardContent>

          {blog.tags && blog.tags.length > 0 && (
            <CardFooter className="p-6 border-t">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Tag className="mr-1 h-5 w-5 text-muted-foreground" />
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs sm:text-sm">{tag}</Badge>
                ))}
              </div>
            </CardFooter>
          )}
        </Card>
      </article>
    </PageWrapper>
  );
}
