
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Link as LinkIcon, Trash2 } from 'lucide-react';
import type { IContentHandle } from '@/models/ContentHandle';
import { useState } from 'react';

interface ContentHandleCardProps {
  handle: IContentHandle;
  onDelete: () => void;
}

export function ContentHandleCard({ handle, onDelete }: ContentHandleCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    // No need to set isDeleting to false if the component unmounts
  };

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-7 w-7">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the "{handle.name}" handle.
              </AlertDialogDescription>
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
      <a href={handle.link} target="_blank" rel="noopener noreferrer" className="block h-full">
        <Card className="h-full hover:shadow-xl hover:border-primary transition-all flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <LinkIcon className="mr-2 h-5 w-5 text-primary/80" />
              {handle.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>
              {handle.description || "No description provided."}
            </CardDescription>
          </CardContent>
        </Card>
      </a>
    </div>
  );
}
