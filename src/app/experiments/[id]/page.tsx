
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IExperiment } from "@/models/Experiment";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CalendarDays, Tag, ExternalLink, PlayCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getExperiment(id: string): Promise<IExperiment | null> {
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
    console.error(`Error: Could not determine domain for API call in getExperiment (id: ${id}). Ensure VERCEL_URL or NEXT_PUBLIC_DOMAIN is set, or NODE_ENV is 'development' for local fallback.`);
    throw new Error("Configuration error: Cannot determine API domain.");
  }
  
  const fetchUrl = `${determinedDomain}/api/experiments/${id}`;
  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Failed to fetch experiment: ${res.statusText} (status: ${res.status}) from ${fetchUrl}`);
      throw new Error(`Failed to fetch experiment: ${res.statusText} (status: ${res.status})`);
    }
    return res.json();
  } catch (error) {
     console.error(`Fetch error in getExperiment for URL ${fetchUrl}:`, error);
    throw error;
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

export default async function ExperimentDetailPage({ params }: { params: { id: string } }) {
  let experiment: IExperiment | null = null;
  try {
    experiment = await getExperiment(params.id);
  } catch (error) {
    // Error logged in getExperiment
  }

  if (!experiment) {
    notFound();
  }

  const formattedDate = new Date(experiment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const youtubeEmbedUrl = experiment.youtubeVideoLink ? getYouTubeEmbedUrl(experiment.youtubeVideoLink) : null;

  return (
    <PageWrapper>
      <article className="max-w-3xl mx-auto">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="space-y-3 p-6">
            <Badge variant="secondary" className="text-sm uppercase w-fit">{experiment.category}</Badge>
            <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">
              {experiment.title}
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
              <p>{experiment.description}</p>
            </div>
            
            {experiment.tryHereLink && (
              <div className="pt-4">
                <Button asChild size="lg" className="shadow-md">
                  <Link href={experiment.tryHereLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Try Experiment / View Source
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>

          {experiment.tags && experiment.tags.length > 0 && (
            <CardFooter className="p-6 border-t">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Tag className="mr-1 h-5 w-5 text-muted-foreground" />
                {experiment.tags.map((tag) => (
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
