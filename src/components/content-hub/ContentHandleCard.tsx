
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Facebook, Youtube, Github, FileText, BotMessageSquare, Globe } from 'lucide-react';
import type { IContentHandle } from '@/models/ContentHandle';
import { cn } from '@/lib/utils';

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

  return (
    <Link href={handle.link} target="_blank" rel="noopener noreferrer" className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg">
      <Card
        className={cn(
          "flex flex-col h-full transition-all duration-200 border-2 border-transparent hover:border-primary cursor-pointer relative group"
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                  {getIconForLink(handle.link)}
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

        <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                onClick={handleDelete}
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
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </Link>
  );
}
