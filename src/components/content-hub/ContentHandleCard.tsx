"use client";

import { useState } from 'react';
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

  // This function opens the link in a new tab.
  const handleCardClick = () => {
    window.open(handle.link, '_blank', 'noopener,noreferrer');
  };

  // This function stops the click from propagating to the underlying card.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative group h-full">
        <Card 
            // The onClick handler to open the link in a new tab.
            onClick={handleCardClick}
            className="flex flex-col h-full transition-all duration-200 border group-hover:border-primary group-hover:shadow-lg cursor-pointer"
            // tabIndex allows the card to be focusable for keyboard navigation.
            tabIndex={0}
            // onKeyDown allows keyboard users (Enter/Space) to trigger the click.
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
        >
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
      
      {/* The delete button is positioned on top of the card. */}
      {/* Its onClick handler stops the event, so clicking it won't trigger handleCardClick. */}
      <div className="absolute top-3 right-3 z-10" onClick={stopPropagation}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-background/60 hover:bg-background" 
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent> 
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{handle.name}" handle.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
