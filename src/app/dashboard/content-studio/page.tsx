
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect, useCallback } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Link as LinkIcon, PlusCircle } from "lucide-react";
import type { IContentHandle } from "@/models/ContentHandle";
import { ContentHandleCard } from "@/components/dashboard/ContentHandleCard";
import { ROLES } from "@/config/roles";

const handleFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).max(50),
  link: z.string().url({ message: "Please enter a valid URL." }),
  description: z.string().max(200).optional(),
});

type HandleFormValues = z.infer<typeof handleFormSchema>;

export default function ContentStudioPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [handles, setHandles] = useState<IContentHandle[]>([]);
  const [isLoadingHandles, setIsLoadingHandles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  const form = useForm<HandleFormValues>({
    resolver: zodResolver(handleFormSchema),
    defaultValues: { name: "", link: "", description: "" },
  });

  const fetchHandles = useCallback(async () => {
    setIsLoadingHandles(true);
    setError(null);
    try {
      const response = await fetch("/api/content-handles");
      if (!response.ok) throw new Error("Failed to fetch content handles.");
      const data = await response.json();
      setHandles(data.handles || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoadingHandles(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (canManage) {
        fetchHandles();
      } else {
        toast({ title: "Access Denied", description: "You don't have permission to manage content handles.", variant: "destructive" });
        router.push("/dashboard");
      }
    }
  }, [authLoading, canManage, router, toast, fetchHandles]);

  async function onSubmit(data: HandleFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/content-handles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Creation failed");
      }
      
      toast({ title: "Handle Created", description: "The new content handle has been added." });
      form.reset();
      fetchHandles(); // Refetch the list
    } catch (error) {
      toast({ title: "Creation Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDelete = async (handleId: string) => {
    try {
      const response = await fetch(`/api/content-handles/${handleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || "Deletion failed");
      }

      toast({ title: "Handle Deleted", description: "The content handle has been removed." });
      setHandles(prev => prev.filter(h => h._id !== handleId));
    } catch (error) {
      toast({ title: "Deletion Failed", description: (error as Error).message, variant: "destructive" });
    }
  };

  if (authLoading || (!canManage && !authLoading)) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center">
                <LinkIcon className="mr-3 h-6 w-6 text-primary" />
                Content Handles
              </CardTitle>
              <CardDescription>
                Your saved links to various content creation platforms and tools. Click any card to open the link in a new tab.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHandles ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              ) : handles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {handles.map(handle => (
                    <ContentHandleCard key={handle._id} handle={handle} onDelete={() => handleDelete(handle._id)} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground py-10 text-center">No content handles added yet. Use the form to add your first one.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                Add New Handle
              </CardTitle>
              <CardDescription>Add a new link to your content studio.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Handle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Facebook Page" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://facebook.com/yourpage" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A short description of this handle." {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "Adding..." : "Add Handle"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
