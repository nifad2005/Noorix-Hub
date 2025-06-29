
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, AlertCircle, Inbox, Lightbulb, ListRestart } from "lucide-react";
import type { IContentHandle } from "@/models/ContentHandle";
import { ContentHandleCard } from "@/components/content-hub/ContentHandleCard";
import { ROLES } from "@/config/roles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

const handleFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(100),
  link: z.string().url("Please enter a valid URL."),
  description: z.string().max(500).optional(),
});

type HandleFormValues = z.infer<typeof handleFormSchema>;

const getHostname = (link: string): string => {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, '');
  } catch (error) {
    return link;
  }
};

export default function ContentHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [handles, setHandles] = useState<IContentHandle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  
  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHandle, setEditingHandle] = useState<IContentHandle | null>(null);
  const [activeHandleId, setActiveHandleId] = useState<string | null>(null);

  const form = useForm<HandleFormValues>({
    resolver: zodResolver(handleFormSchema),
    defaultValues: { name: "", link: "", description: "" },
  });
  
  const editForm = useForm<HandleFormValues>({
    resolver: zodResolver(handleFormSchema),
    defaultValues: { name: "", link: "", description: "" },
  });

  const canManageContent = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  const fetchHandles = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await fetch("/api/content-handles");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch content handles");
      }
      const data = await response.json();
      setHandles(data);
    } catch (err) {
      setError((err as Error).message);
      console.error("Fetch Handles Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);
  
  const handleCardClick = (handle: IContentHandle) => {
    setActiveHandleId(handle._id as string);
    // The link is now opened via the card's onClick handler
  }

  useEffect(() => {
    if (!authLoading) {
      if (canManageContent) {
        fetchHandles();
      } else if (!canManageContent) {
        router.push("/dashboard");
      }
    }
  }, [authLoading, canManageContent, fetchHandles, router]);

  // Handle Create Submit
  const onCreateSubmit = async (data: HandleFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/content-handles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create handle");
      }

      toast({ title: "Success", description: "Content handle created successfully." });
      form.reset();
      setIsCreateDialogOpen(false);
      fetchHandles();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Edit Submit
  const onEditSubmit = async (data: HandleFormValues) => {
    if (!editingHandle) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/content-handles/${editingHandle._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update handle");
      }

      toast({ title: "Success", description: "Content handle updated successfully." });
      setIsEditDialogOpen(false);
      setEditingHandle(null);
      fetchHandles();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const openEditDialog = (handle: IContentHandle) => {
    setEditingHandle(handle);
    editForm.reset({
      name: handle.name,
      link: handle.link,
      description: handle.description || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const onHandleDeleted = (deletedHandleId: string) => {
    setHandles(prevHandles => prevHandles.filter(h => h._id !== deletedHandleId));
  };
  
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
    }

    const newHandles = Array.from(handles);
    const [reorderedItem] = newHandles.splice(source.index, 1);
    newHandles.splice(destination.index, 0, reorderedItem);

    setHandles(newHandles); // Optimistic update

    const orderedIds = newHandles.map(handle => handle._id as string);

    try {
      const response = await fetch('/api/content-handles/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to save new order');
      }
      toast({ title: "Success", description: "New order saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not save the new order. Reverting.", variant: "destructive" });
      setHandles(handles); // Revert on error
    }
  };

  const handleAutoReorder = async () => {
    setIsReordering(true);
    const originalHandles = [...handles];
    try {
      const sortedHandles = [...handles].sort((a, b) => {
        const hostnameA = getHostname(a.link);
        const hostnameB = getHostname(b.link);
        return hostnameA.localeCompare(hostnameB);
      });

      const orderedIds = sortedHandles.map(handle => handle._id as string);

      setHandles(sortedHandles); // Optimistic UI update

      const response = await fetch('/api/content-handles/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        setHandles(originalHandles); // Revert UI on failure
        throw new Error('Failed to save the new order');
      }

      toast({ title: "Success", description: "Handles have been reordered alphabetically." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not save the new order.", variant: "destructive" });
      setHandles(originalHandles); // Revert on any error
    } finally {
      setIsReordering(false);
    }
  };


  if (authLoading || (!canManageContent && !authLoading)) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <div className="space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Content Hub</h1>
            <p className="text-muted-foreground">Manage and reorder your content creation links.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAutoReorder} disabled={isReordering || handles.length < 2}>
              {isReordering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListRestart className="mr-2 h-4 w-4" />}
              Auto Reorder
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> New Handle</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Content Handle</DialogTitle>
                  <DialogDescription>
                    Add a new link. You can reorder it later by dragging.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handle Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Facebook Page" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="link" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link URL</FormLabel>
                        <FormControl><Input type="url" placeholder="https://facebook.com/your-page" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="A short description of this handle." {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? "Adding..." : "Add Handle"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

         <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Pro Tip!</AlertTitle>
          <AlertDescription>
            You can drag and drop the cards to reorder them. Use Ctrl/Cmd + click to open links in a new tab without leaving the page.
          </AlertDescription>
        </Alert>

        <DragDropContext onDragEnd={onDragEnd}>
            {isLoadingData ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="p-6 flex items-center space-x-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-destructive">Failed to load handles</h3>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : handles.length === 0 ? (
              <Card className="text-center">
                <CardContent className="p-10">
                  <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No content handles added yet. Use the button above to add your first one.</p>
                </CardContent>
              </Card>
            ) : (
             <Droppable droppableId="handles">
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {handles.map((handle, index) => (
                            <Draggable key={handle._id as string} draggableId={handle._id as string} index={index}>
                                {(provided) => (
                                     <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                     >
                                        <ContentHandleCard 
                                            handle={handle} 
                                            onHandleDeleted={onHandleDeleted}
                                            onEdit={() => openEditDialog(handle)}
                                            isActive={handle._id === activeHandleId}
                                            onCardClick={() => handleCardClick(handle)}
                                        />
                                     </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
             </Droppable>
            )}
        </DragDropContext>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Content Handle</DialogTitle>
            <DialogDescription>
              Update the details for this handle. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Handle Name</FormLabel>
                  <FormControl><Input {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="link" render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL</FormLabel>
                  <FormControl><Input type="url" {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl><Textarea {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

    