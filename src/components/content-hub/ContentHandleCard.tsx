
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Link as LinkIcon, Facebook, Youtube, Github, FileText, BotMessageSquare, Globe } from 'lucide-react';
import type { IContentHandle } from '@/models/ContentHandle';

interface ContentHandleCardProps {
  handle: IContentHandle;
  onHandleDeleted: (handleId: string) => void;
}

const getIconForLink = (link: string) => {
  try {
    const url = new URL(link);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('facebook.com')) return <Facebook className="h-8 w-8 text-primary" />;
    if (hostname.includes('youtube.com')) return <Youtube className="h-8 w-8 text-primary" />;
    if (hostname.includes('github.com')) return <Github className="h-8 w-8 text-primary" />;
    if (hostname.includes('noorix') || hostname.includes('vercel.app')) return <BotMessageSquare className="h-8 w-8 text-primary" />;
    if (hostname.includes('drive.google.com') || hostname.includes('docs.google.com') || hostname.includes('sheets.google.com')) return <FileText className="h-8 w-8 text-primary" />;

  } catch (error) {
    // Invalid URL, return default icon
  }
  return <Globe className="h-8 w-8 text-primary" />;
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

  return (
    <Card className="flex flex-col h-full group relative transition-shadow hover:shadow-xl">
      <Link href={handle.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-0" aria-label={`Open ${handle.name}`} />
      <CardHeader className="flex flex-row items-start justify-between z-10">
        <div className="flex-1 space-y-1">
          <CardTitle className="truncate text-lg">{handle.name}</CardTitle>
          <CardDescription className="h-10 line-clamp-2">
            {handle.description || 'No description provided.'}
          </CardDescription>
        </div>
         <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.preventDefault()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={isDeleting}>
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
      </CardHeader>
      <CardContent className="mt-auto z-10">
        <div className="flex items-center justify-between">
            {getIconForLink(handle.link)}
            <LinkIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
