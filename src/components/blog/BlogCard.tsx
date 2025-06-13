
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tag } from 'lucide-react';
import type { IBlog } from '@/models/Blog'; // Assuming IBlog will be adapted

interface BlogCardProps {
  blog: Partial<IBlog> & { _id: string; snippet?: string; }; // Use a partial type with essentials
}

export function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date N/A';

  return (
    <Link href={`/blogs/${blog._id}`} passHref>
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out group">
        <CardHeader className="p-0">
          <div className="aspect-video overflow-hidden">
            <Image
              src={blog.featuredImage || `https://placehold.co/600x400.png?text=${encodeURIComponent(blog.title || 'Blog Post')}`}
              alt={blog.title || 'Blog post image'}
              width={600}
              height={400}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
              data-ai-hint="article theme"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-2">
          {blog.category && (
            <Badge variant="secondary" className="text-xs uppercase">{blog.category}</Badge>
          )}
          <CardTitle className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
            {blog.title || 'Untitled Blog Post'}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-3">
            {blog.snippet || 'No snippet available.'}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2 border-t">
          <div className="w-full space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center text-xs text-muted-foreground">
                 <Tag className="mr-1 h-3.5 w-3.5" />
                {blog.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="px-1.5 py-0.5 text-xs">{tag}</Badge>
                ))}
                {blog.tags.length > 3 && <span className="text-xs">+{blog.tags.length - 3} more</span>}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
