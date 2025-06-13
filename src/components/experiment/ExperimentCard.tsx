
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Tag, FlaskConical, Pencil, Trash2 } from 'lucide-react';
import type { IExperiment } from '@/models/Experiment';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ExperimentCardProps {
  experiment: Partial<IExperiment> & { _id: string; snippet?: string; };
  onExperimentDeleted?: (experimentId: string) => void;
}

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

export function ExperimentCard({ experiment, onExperimentDeleted }: ExperimentCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const formattedDate = experiment.createdAt ? new Date(experiment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date N/A';

  const handleDelete = async () => {
    if (!experiment._id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/experiments/${experiment._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete experiment');
      }
      toast({
        title: "Experiment Deleted",
        description: `Experiment "${experiment.title}" has been deleted.`,
      });
      if (onExperimentDeleted) {
        onExperimentDeleted(experiment._id);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting experiment:", error);
      toast({
        title: "Deletion Failed",
        description: (error as Error).message || "Could not delete the experiment.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out group relative">
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1 bg-card p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link href={`/dashboard/edit-experiment/${experiment._id}`} passHref>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Experiment</span>
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-7 w-7" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Experiment</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the experiment
                  "{experiment.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="md:w-32 md:shrink-0 bg-muted flex items-center justify-center p-4 md:p-0">
        <FlaskConical className="h-16 w-16 text-primary opacity-70" />
      </div>
      <div className="flex flex-col flex-grow">
        <CardHeader className="p-4 pb-2">
          {experiment.category && (
            <Badge variant="secondary" className="text-xs uppercase w-fit mb-1">{experiment.category}</Badge>
          )}
          <Link href={`/experiments/${experiment._id}`} passHref className="block">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors cursor-pointer">
              {experiment.title || 'Untitled Experiment'}
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0 space-y-2">
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
            {experiment.snippet || 'No description available.'}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2 border-t mt-auto">
          <div className="w-full space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            {experiment.tags && experiment.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center text-xs text-muted-foreground">
                <Tag className="mr-1 h-3.5 w-3.5" />
                {experiment.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="px-1.5 py-0.5 text-xs">{tag}</Badge>
                ))}
                {experiment.tags.length > 3 && <span className="text-xs">+{experiment.tags.length - 3} more</span>}
              </div>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
