
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IBlog } from "@/models/Blog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getBlog(id: string): Promise<IBlog | null> {
  console.log(`[getBlog] Received ID: ${id}`);
  let determinedDomain: string | undefined;

  if (process.env.VERCEL_URL) {
    determinedDomain = `https://${process.env.VERCEL_URL}`;
    console.log(`[getBlog] Using VERCEL_URL: ${determinedDomain}`);
  } else if (process.env.NEXT_PUBLIC_DOMAIN) {
     determinedDomain = process.env.NEXT_PUBLIC_DOMAIN.startsWith('http')
      ? process.env.NEXT_PUBLIC_DOMAIN
      : `https://${process.env.NEXT_PUBLIC_DOMAIN}`;
    console.log(`[getBlog] Using NEXT_PUBLIC_DOMAIN: ${determinedDomain}`);
  } else if (process.env.NODE_ENV === 'development') {
    determinedDomain = 'http://localhost:9002';
    console.log(`[getBlog] Using local development domain: ${determinedDomain}`);
  }

  if (!determinedDomain) {
    console.error(`[getBlog] Error: Could not determine domain for API call (id: ${id}). Ensure VERCEL_URL or NEXT_PUBLIC_DOMAIN is set, or NODE_ENV is 'development' for local fallback.`);
    return null;
  }

  const fetchUrl = `${determinedDomain}/api/blogs/${id}`;
  console.log(`[getBlog] Attempting to fetch from URL: ${fetchUrl}`);

  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    console.log(`[getBlog] Fetch response status: ${res.status} for URL: ${fetchUrl}`);

    if (!res.ok) {
      const responseText = await res.text().catch(() => "Could not read response body");
      console.error(`[getBlog] Failed to fetch blog. Status: ${res.status}, StatusText: ${res.statusText}, URL: ${fetchUrl}, Response: ${responseText}`);
      if (res.status === 404) {
        console.log(`[getBlog] API returned 404 for blog ID ${id}. Returning null to trigger notFound().`);
      }
      return null;
    }

    try {
      const data = await res.json();
      console.log(`[getBlog] Successfully fetched blog data for ID ${id}.`);
      return data;
    } catch (jsonError) {
      console.error(`[getBlog] Failed to parse JSON response for ID ${id}. URL: ${fetchUrl}, Error:`, jsonError);
      // Attempt to read response as text for further debugging if JSON parsing failed.
      // Note: res.text() can only be consumed once.
      // const responseTextForJsonError = await res.text().catch(() => "Could not read response body after JSON parse error");
      // console.error(`[getBlog] Response text after JSON parse error: ${responseTextForJsonError}`);
      return null; // Trigger notFound()
    }
  } catch (error) {
    console.error(`[getBlog] Catch block: Fetch error for URL ${fetchUrl}:`, error);
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: { id: string } }) {
  console.log(`[BlogDetailPage] Rendering for blog ID: ${params.id}`);
  let blog: IBlog | null = null;
  try {
    blog = await getBlog(params.id);
  } catch (error) {
    console.error(`[BlogDetailPage] Error caught while calling getBlog for ID ${params.id}:`, error);
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
