
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IBlog } from "@/models/Blog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getBlog(id: string): Promise<IBlog | null> {
  let determinedDomain: string | undefined;

  if (process.env.VERCEL_URL) {
    determinedDomain = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_DOMAIN) {
     determinedDomain = process.env.NEXT_PUBLIC_DOMAIN.startsWith('http')
      ? process.env.NEXT_PUBLIC_DOMAIN
      : `https://${process.env.NEXT_PUBLIC_DOMAIN}`;
  } else if (process.env.NODE_ENV === 'development') {
    determinedDomain = 'http://localhost:9002';
  }

  if (!determinedDomain) {
    console.error(`Error: Could not determine domain for API call in getBlog (id: ${id}). Ensure VERCEL_URL or NEXT_PUBLIC_DOMAIN is set, or NODE_ENV is 'development' for local fallback.`);
    // For detail pages, it's usually better to throw an error or return null to trigger notFound()
    // if the base URL can't be determined, as fetching will fail.
    throw new Error("Configuration error: Cannot determine API domain.");
  }

  const fetchUrl = `${determinedDomain}/api/blogs/${id}`;
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
    throw error; 
  }
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  let blog: IBlog | null = null;
  try {
    blog = await getBlog(params.id);
  } catch (error) {
    // Error already logged in getBlog
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
