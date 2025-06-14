
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IBlog } from "@/models/Blog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getBlog(id: string): Promise<IBlog | null> {
  let domain = process.env.NEXT_PUBLIC_DOMAIN;
  if (process.env.VERCEL_URL) {
    domain = `https://${process.env.VERCEL_URL}`;
  } else if (!domain && process.env.NODE_ENV === 'development') {
    domain = 'http://localhost:9002';
  } else if (!domain) {
    console.warn("Warning: NEXT_PUBLIC_DOMAIN environment variable is not set for getBlog. Fetching might fail.");
  }

  const fetchUrl = `${domain}/api/blogs/${id}`;
  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Failed to fetch blog: ${res.statusText} (status: ${res.status}) from ${fetchUrl}`);
      throw new Error(`Failed to fetch blog: ${res.statusText} (status: ${res.status})`);
    }
    return res.json();
  } catch (error) {
    console.error(`Fetch error in getBlog for URL ${fetchUrl}:`, error);
    // Depending on how you want to handle this, you might re-throw, return null, or redirect.
    // For now, let's align with existing behavior which might lead to notFound() if error occurs.
    throw error; // Re-throw to be caught by Next.js error handling or a try-catch in the component
  }
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  let blog: IBlog | null = null;
  try {
    blog = await getBlog(params.id);
  } catch (error) {
    // Error already logged in getBlog, notFound will be triggered if blog remains null
  }


  if (!blog) {
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
