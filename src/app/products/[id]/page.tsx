
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
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:9002';
  const res = await fetch(`${domain}/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch product: ${res.statusText} (status: ${res.status})`);
  }
  return res.json();
}

function getYouTubeEmbedUrl(youtubeUrl: string): string | null {
  if (!youtubeUrl) return null;
  let videoId = null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?]+)/,
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
  const product = await getProduct(params.id);

  if (!product) {
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
