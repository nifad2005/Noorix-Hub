
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<HandleFormValues>({
    resolver: zodResolver(handleFormSchema),
    defaultValues: { name: "", link: "", description: "" },
  });

  const canManage = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  const fetchHandles = useCallback(async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await fetch("/api/content-handles");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch content handles.");
      }
      const data = await response.json();
      setHandles(data.handles || []);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && canManage) {
      fetchHandles();
    } else if (!authLoading && !canManage) {
      // If auth is loaded but user is not admin, stop loading.
      setIsLoadingData(false);
    }
  }, [authLoading, canManage, fetchHandles]);

  async function onSubmit(data: HandleFormValues) {
    setIsSubmittingForm(true);
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
      await fetchHandles(); // Refetch the list after adding
    } catch (error) {
      toast({ title: "Creation Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  }

  const handleDelete = useCallback(async (handleId: string) => {
    try {
      const response = await fetch(`/api/content-handles/${handleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || "Deletion failed");
      }
      toast({ title: "Handle Deleted", description: "The content handle has been removed." });
      await fetchHandles(); // Refetch the list after deleting
    } catch (error) {
      toast({ title: "Deletion Failed", description: (error as Error).message, variant: "destructive" });
    }
  }, [toast, fetchHandles]);

  if (authLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-20rem)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (!canManage) {
    return (
       <PageWrapper>
        <Card className="max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>You do not have permission to view this page. Please contact an administrator.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
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
              {isLoadingData ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-destructive flex items-center gap-2 p-4 bg-destructive/10 rounded-md">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Error loading handles</p>
                    <p className="text-sm">{error}</p>
                  </div>
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
                          <Input placeholder="e.g., Facebook Page" {...field} disabled={isSubmittingForm} />
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
                          <Input type="url" placeholder="https://facebook.com/yourpage" {...field} disabled={isSubmittingForm} />
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
                          <Textarea placeholder="A short description of this handle." {...field} disabled={isSubmittingForm} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isSubmittingForm}>
                    {isSubmittingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmittingForm ? "Adding..." : "Add Handle"}
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
