
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IProduct } from "@/models/Product";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Tag, ExternalLink, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getProduct(id: string): Promise<IProduct | null> {
  console.log(`[getProduct] Received ID: ${id}`);
  
  let determinedDomain: string | undefined;

  if (process.env.VERCEL_URL) {
    determinedDomain = `https://${process.env.VERCEL_URL}`;
    console.log(`[getProduct] Using VERCEL_URL for domain: ${determinedDomain}`);
  } else if (process.env.NEXT_PUBLIC_DOMAIN) {
    determinedDomain = process.env.NEXT_PUBLIC_DOMAIN.startsWith('http')
      ? process.env.NEXT_PUBLIC_DOMAIN
      : `https://${process.env.NEXT_PUBLIC_DOMAIN}`;
    console.log(`[getProduct] Using NEXT_PUBLIC_DOMAIN for domain: ${determinedDomain}`);
  } else if (process.env.NODE_ENV === 'development') {
    determinedDomain = 'http://localhost:9002'; // Your dev port
    console.log(`[getProduct] Using development localhost domain: ${determinedDomain}`);
  } else {
    console.warn('[getProduct] Warning: Could not determine API domain. VERCEL_URL and NEXT_PUBLIC_DOMAIN are not set, and not in development mode. Throwing error.');
    throw new Error('Server configuration error: API domain could not be determined.');
  }

  const fetchUrl = `${determinedDomain}/api/products/${id}`;
  console.log(`[getProduct] Attempting to fetch from absolute URL: ${fetchUrl}`);

  let res: Response;
  try {
    res = await fetch(fetchUrl, { cache: 'no-store' });
  } catch (fetchError) {
    console.error(`[getProduct] Network fetch error for URL ${fetchUrl}:`, fetchError);
    throw new Error(`Network error fetching product: ${(fetchError as Error).message}`);
  }

  console.log(`[getProduct] Fetch response status: ${res.status} for URL: ${fetchUrl}`);

  if (res.status === 404) {
    console.log(`[getProduct] API returned 404 for product ID ${id}. Resource not found.`);
    return null; // Explicitly not found
  }

  if (!res.ok) {
    const responseText = await res.text().catch(() => "Could not read error response body");
    console.error(`[getProduct] API error. Status: ${res.status}, URL: ${fetchUrl}, Response: ${responseText.substring(0, 500)}...`);
    throw new Error(`API error fetching product: ${res.status} ${res.statusText}.`);
  }
    
  try {
    const data = await res.json();
    console.log(`[getProduct] Successfully fetched product data for ID ${id}. Title: ${data.title}`);
    return data;
  } catch (jsonError) {
    console.error(`[getProduct] Failed to parse JSON response for ID ${id}. URL: ${fetchUrl}, Error:`, jsonError);
    let responseTextForJsonError = "Could not re-read response body after JSON parse error";
    try {
        const textResponse = await res.clone().text();
        responseTextForJsonError = textResponse;
    } catch (textReadError) {
        console.error(`[getProduct] Error trying to read response text after JSON parse failure:`, textReadError);
    }
    console.error(`[getProduct] Response text that caused JSON error: ${responseTextForJsonError.substring(0, 500)}...`);
    throw new Error(`Error parsing product data: ${(jsonError as Error).message}`);
  }
}

function getYouTubeEmbedUrl(youtubeUrl: string): string | null {
  if (!youtubeUrl) return null;
  let videoId = null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/youtu\.be\/([^?]+))/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = youtubeUrl.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  console.log(`[ProductDetailPage] Rendering for product ID: ${params.id}`);
  let product: IProduct | null = null;
  try {
    product = await getProduct(params.id);
  } catch (error) {
     console.error(`[ProductDetailPage] Error caught while calling getProduct for ID ${params.id}:`, error);
     throw error;
  }

  if (!product) {
    console.log(`[ProductDetailPage] Product data not found for ID ${params.id} (API returned 404), calling notFound().`);
    notFound();
  }

  const formattedDate = new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const youtubeEmbedUrl = product.youtubeVideoLink ? getYouTubeEmbedUrl(product.youtubeVideoLink) : null;

  return (
    <PageWrapper>
      <article className="max-w-3xl mx-auto">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="space-y-3 p-6">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary" className="text-sm uppercase">{product.category}</Badge>
              {product.status && (
                <Badge variant={product.status === 'featured' ? 'default' : 'outline'} className="text-sm capitalize">
                    <ShieldCheck className="mr-1.5 h-4 w-4" />
                    {product.status}
                </Badge>
                )}
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">
              {product.title}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Published on {formattedDate}</span>
            </div>
          </CardHeader>

          {youtubeEmbedUrl && (
            <div className="bg-muted p-4 md:p-6">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  className="rounded-lg w-full h-full"
                  src={youtubeEmbedUrl}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </AspectRatio>
            </div>
          )}

          <CardContent className="p-6 space-y-6">
            <div className="prose prose-lg max-w-none dark:prose-invert text-foreground text-base md:text-lg leading-relaxed">
              <p>{product.description}</p>
            </div>

            {product.tryHereLink && (
              <div className="pt-4">
                <Button asChild size="lg" className="shadow-md">
                  <Link href={product.tryHereLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Try Product / View Source
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>

          {product.tags && product.tags.length > 0 && (
            <CardFooter className="p-6 border-t">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Tag className="mr-1 h-5 w-5 text-muted-foreground" />
                {product.tags.map((tag) => (
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
