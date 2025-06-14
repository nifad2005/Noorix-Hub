
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IBlog } from "@/models/Blog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Tag } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getBlog(id: string): Promise<IBlog | null> {
  console.log(`[getBlog] Received ID: ${id}`);
  
  // Using relative path for API call from Server Component
  const fetchUrl = `/api/blogs/${id}`;
  console.log(`[getBlog] Attempting to fetch from relative URL: ${fetchUrl}`);

  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    console.log(`[getBlog] Fetch response status: ${res.status} for URL: ${fetchUrl}`);

    if (!res.ok) {
      const responseText = await res.text().catch(() => "Could not read response body");
      console.error(`[getBlog] Failed to fetch blog. Status: ${res.status}, StatusText: ${res.statusText}, URL: ${fetchUrl}, Response: ${responseText}`);
      if (res.status === 404) {
        console.log(`[getBlog] API returned 404 for blog ID ${id}.`);
      }
      return null;
    }

    try {
      const data = await res.json();
      console.log(`[getBlog] Successfully fetched blog data for ID ${id}. Title: ${data.title}`);
      return data;
    } catch (jsonError) {
      console.error(`[getBlog] Failed to parse JSON response for ID ${id}. URL: ${fetchUrl}, Error:`, jsonError);
      // Attempt to read response as text for further debugging if JSON parsing failed.
      const responseTextForJsonError = await fetch(fetchUrl).then(r => r.text()).catch(() => "Could not read response body after JSON parse error on retry");
      console.error(`[getBlog] Response text that caused JSON error: ${responseTextForJsonError.substring(0, 500)}...`);
      return null; 
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
