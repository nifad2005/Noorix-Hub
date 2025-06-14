
import { PageWrapper } from "@/components/layout/PageWrapper";
import type { IExperiment } from "@/models/Experiment";
import connectDB from "@/lib/db"; // Import connectDB
import ExperimentModel from "@/models/Experiment"; // Import Mongoose model
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CalendarDays, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

async function getExperiment(id: string): Promise<IExperiment | null> {
  console.log(`[getExperiment DB] Received ID: ${id}`);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    console.log(`[getExperiment DB] Invalid experiment ID format: ${id}. Returning null.`);
    return null;
  }

  try {
    await connectDB();
    console.log(`[getExperiment DB] DB connected. Searching for experiment with ID: ${id}`);
    const experimentData = await ExperimentModel.findById(id).lean<IExperiment>();

    if (!experimentData) {
      console.log(`[getExperiment DB] Experiment not found in DB for ID: ${id}. Returning null.`);
      return null;
    }
    console.log(`[getExperiment DB] Experiment found for ID: ${id}. Title: ${experimentData.title}`);
    return JSON.parse(JSON.stringify(experimentData)) as IExperiment;
  } catch (error) {
    console.error(`[getExperiment DB] Error fetching experiment for ID: ${id}. Error:`, error);
    throw new Error(`Error fetching experiment from database: ${(error as Error).message}`);
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
  console.log(`[ExperimentDetailPage] Rendering for experiment ID: ${params.id}`);
  let experiment: IExperiment | null = null;
  try {
    experiment = await getExperiment(params.id);
  } catch (error) {
    console.error(`[ExperimentDetailPage] Error caught while calling getExperiment for ID ${params.id}:`, error);
    throw error;
  }

  if (!experiment) {
    console.log(`[ExperimentDetailPage] Experiment data not found for ID ${params.id}, calling notFound().`);
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
