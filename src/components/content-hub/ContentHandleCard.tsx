"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Facebook, Youtube, Github, FileText, BotMessageSquare, Globe, ExternalLink } from 'lucide-react';
import type { IContentHandle } from '@/models/ContentHandle';

interface ContentHandleCardProps {
  handle: IContentHandle;
  onHandleDeleted: (handleId: string) => void;
}

const getIconForLink = (link: string) => {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    
    // Using a consistent style for all icons
    const iconProps = { className: "h-6 w-6 text-muted-foreground" };

    if (hostname.includes('facebook.com')) return <Facebook {...iconProps} />;
    if (hostname.includes('youtube.com')) return <Youtube {...iconProps} />;
    if (hostname.includes('github.com')) return <Github {...iconProps} />;
    if (hostname.includes('noorix') || hostname.includes('vercel.app')) return <BotMessageSquare {...iconProps} />;
    if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com') || hostname.includes('sheets.google.com')) return <FileText {...iconProps} />;

  } catch (error) {
    // Invalid URL, return default icon
  }
  return <Globe className="h-6 w-6 text-muted-foreground" />;
};

export function ContentHandleCard({ handle, onHandleDeleted }: ContentHandleCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Corrected: The function no longer expects an event argument.
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/content-handles/${handle._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete handle");
      }

      toast({ title: "Success", description: `"${handle.name}" has been deleted.` });
      onHandleDeleted(handle._id as string);
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const preventDefaultAndPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="relative group h-full">
        <Link href={handle.link} target="_blank" rel="noopener noreferrer" className="block h-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl" aria-label={`Open ${handle.name}`}>
            <Card className="flex flex-col h-full transition-all duration-200 border group-hover:border-primary group-hover:shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                    <div className="p-3 bg-muted rounded-lg">
                        {getIconForLink(handle.link)}
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold line-clamp-1">{handle.name}</CardTitle>
                    </div>
                     <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                    <CardDescription className="h-10 line-clamp-2 text-sm">
                        {handle.description || 'No description provided.'}
                    </CardDescription>
                </CardContent>
            </Card>
        </Link>
      
      <div className="absolute top-3 right-3 z-10">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-background/60 hover:bg-background" 
              onClick={preventDefaultAndPropagation} 
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          {/* Using preventDefaultAndPropagation here too, just in case to stop the link from firing */}
          <AlertDialogContent onClick={preventDefaultAndPropagation}> 
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{handle.name}" handle.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {/* Correctly calling handleDelete without any arguments */}
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
