
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Facebook, Youtube, Github, FileText, BotMessageSquare, Globe, Pencil, Instagram, Linkedin } from 'lucide-react';
import type { IContentHandle } from '@/models/ContentHandle';
import { cn } from '@/lib/utils';

// Specific icon for X/Twitter as it's not in lucide-react
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);


interface ContentHandleCardProps {
  handle: IContentHandle;
  onHandleDeleted: (handleId: string) => void;
  onEdit: () => void;
  isActive: boolean;
  onCardClick: () => void;
}

interface HandleVisuals {
  Icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
}

const getHandleVisuals = (link: string): HandleVisuals => {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase().replace('www.', ''); // Normalize hostname

    if (hostname.includes('facebook.com')) {
      return { Icon: Facebook, iconBgClass: 'bg-blue-600', iconColorClass: 'text-white' };
    }
    if (hostname.includes('youtube.com')) {
      return { Icon: Youtube, iconBgClass: 'bg-red-600', iconColorClass: 'text-white' };
    }
    if (hostname.includes('github.com')) {
      return { Icon: Github, iconBgClass: 'bg-gray-800', iconColorClass: 'text-white' };
    }
    if (hostname.includes('x.com') || hostname.includes('twitter.com')) {
        return { Icon: XIcon, iconBgClass: 'bg-black', iconColorClass: 'text-white' };
    }
    if (hostname.includes('instagram.com')) {
        return { Icon: Instagram, iconBgClass: 'bg-pink-600', iconColorClass: 'text-white' };
    }
    if (hostname.includes('linkedin.com')) {
        return { Icon: Linkedin, iconBgClass: 'bg-sky-700', iconColorClass: 'text-white' };
    }
    if (hostname.includes('noorix')) {
      return { Icon: BotMessageSquare, iconBgClass: 'bg-green-600', iconColorClass: 'text-white' };
    }
    if (hostname.includes('vercel.app')) {
      return { Icon: BotMessageSquare, iconBgClass: 'bg-green-600', iconColorClass: 'text-white' };
    }
    if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com') || hostname.includes('sheets.google.com')) {
      return { Icon: FileText, iconBgClass: 'bg-sky-500', iconColorClass: 'text-white' };
    }
  } catch (error) {
    // Invalid URL, fall through to default
  }
  // Default visuals
  return { Icon: Globe, iconBgClass: 'bg-muted', iconColorClass: 'text-muted-foreground' };
};


export function ContentHandleCard({ handle, onHandleDeleted, onEdit, isActive, onCardClick }: ContentHandleCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { Icon, iconBgClass, iconColorClass } = getHandleVisuals(handle.link);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/content-handles/${handle._id}`, { method: 'DELETE' });
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
  
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent actions if any button inside the card is clicked
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
    
    onCardClick(); // Set the card as active

    // Open in new tab on Ctrl/Cmd click or middle mouse click, or normal click
    window.open(handle.link, '_blank');
    e.preventDefault();
  };

  return (
      <Card
        onClick={handleCardClick}
        className={cn(
          "flex flex-col h-full transition-all duration-200 border-2 cursor-pointer relative group",
          isActive ? "border-primary shadow-lg" : "border-transparent hover:border-primary/50"
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-lg transition-colors", iconBgClass)}>
                  <Icon className={cn("h-6 w-6", iconColorClass)} />
              </div>
              <div className="flex-1 overflow-hidden">
                  <CardTitle className="text-lg font-semibold line-clamp-1">{handle.name}</CardTitle>
              </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-grow">
          <CardDescription className="h-10 line-clamp-2 text-sm">
            {handle.description || 'No description provided.'}
          </CardDescription>
        </CardContent>

        <div className="absolute bottom-2 right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button
            variant="ghost" size="icon" className="h-8 w-8 rounded-full"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
           >
            <Pencil className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                onClick={(e) => e.stopPropagation()} // Prevent card click
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone. This will permanently delete the "{handle.name}" handle.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()} disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
  );
}

    