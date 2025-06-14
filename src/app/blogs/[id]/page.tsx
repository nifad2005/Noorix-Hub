
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
    console.log(`[getBlog] Using VERCEL_URL for domain: ${determinedDomain}`);
  } else if (process.env.NEXT_PUBLIC_DOMAIN) {
    determinedDomain = process.env.NEXT_PUBLIC_DOMAIN.startsWith('http')
      ? process.env.NEXT_PUBLIC_DOMAIN
      : `https://${process.env.NEXT_PUBLIC_DOMAIN}`;
    console.log(`[getBlog] Using NEXT_PUBLIC_DOMAIN for domain: ${determinedDomain}`);
  } else if (process.env.NODE_ENV === 'development') {
    determinedDomain = 'http://localhost:9002'; // Your dev port
    console.log(`[getBlog] Using development localhost domain: ${determinedDomain}`);
  } else {
    console.warn('[getBlog] Warning: Could not determine API domain. VERCEL_URL and NEXT_PUBLIC_DOMAIN are not set, and not in development mode. Throwing error.');
    throw new Error('Server configuration error: API domain could not be determined.');
  }

  const fetchUrl = `${determinedDomain}/api/blogs/${id}`;
  console.log(`[getBlog] Attempting to fetch from absolute URL: ${fetchUrl}`);

  let res: Response;
  try {
    res = await fetch(fetchUrl, { cache: 'no-store' });
  } catch (fetchError) {
    console.error(`[getBlog] Network fetch error for URL ${fetchUrl}:`, fetchError);
    throw new Error(`Network error fetching blog post: ${(fetchError as Error).message}`);
  }
  
  console.log(`[getBlog] Fetch response status: ${res.status} for URL: ${fetchUrl}`);

  if (res.status === 404) {
    console.log(`[getBlog] API returned 404 for blog ID ${id}. Resource not found.`);
    return null; // Explicitly not found
  }

  if (!res.ok) {
    const responseText = await res.text().catch(() => "Could not read error response body");
    console.error(`[getBlog] API error. Status: ${res.status}, URL: ${fetchUrl}, Response: ${responseText.substring(0, 500)}...`);
    throw new Error(`API error fetching blog post: ${res.status} ${res.statusText}.`);
  }

  try {
    const data = await res.json();
    console.log(`[getBlog] Successfully fetched blog data for ID ${id}. Title: ${data.title}`);
    return data;
  } catch (jsonError) {
    console.error(`[getBlog] Failed to parse JSON response for ID ${id}. URL: ${fetchUrl}, Error:`, jsonError);
    // Attempt to get response text if JSON parsing fails, for better debugging
    let responseTextForJsonError = "Could not re-read response body after JSON parse error";
    try {
        // Re-clone the response to read its text body, as the original body might have been consumed
        const textResponse = await res.clone().text();
        responseTextForJsonError = textResponse;
    } catch (textReadError) {
        console.error(`[getBlog] Error trying to read response text after JSON parse failure:`, textReadError);
    }
    console.error(`[getBlog] Response text that caused JSON error: ${responseTextForJsonError.substring(0, 500)}...`);
    throw new Error(`Error parsing blog post data: ${(jsonError as Error).message}`);
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
    // This will only be reached if getBlog returned null (API sent 404)
    console.log(`[BlogDetailPage] Blog data not found for ID ${params.id} (API returned 404), calling notFound().`);
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
