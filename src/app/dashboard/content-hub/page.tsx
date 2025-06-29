
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
import { Loader2, PlusCircle, AlertCircle, Inbox, Lightbulb } from "lucide-react";
import type { IContentHandle } from "@/models/ContentHandle";
import { ContentHandleCard } from "@/components/content-hub/ContentHandleCard";
import { ROLES } from "@/config/roles";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const handleFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(100),
  link: z.string().url("Please enter a valid URL."),
  description: z.string().max(500).optional(),
});

type HandleFormValues = z.infer<typeof handleFormSchema>;

export default function ContentHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [handles, setHandles] = useState<IContentHandle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<HandleFormValues>({
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

  useEffect(() => {
    if (!authLoading) {
      if (canManageContent) {
        fetchHandles();
      } else if (!canManageContent) {
        router.push("/dashboard");
      }
    }
  }, [authLoading, canManageContent, fetchHandles, router]);

  const onSubmit = async (data: HandleFormValues) => {
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
      setIsDialogOpen(false);
      fetchHandles();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onHandleDeleted = (deletedHandleId: string) => {
    setHandles(prevHandles => prevHandles.filter(h => h._id !== deletedHandleId));
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
            <p className="text-muted-foreground">Manage your content creation links and resources.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> New Handle</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Content Handle</DialogTitle>
                <DialogDescription>
                  Add a new link to your content creation tools or platforms. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
        </header>

         <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Pro Tip!</AlertTitle>
          <AlertDescription>
            Hold <kbd className="px-2 py-1.5 text-xs font-semibold text-foreground bg-muted border rounded-lg">Ctrl</kbd> (or <kbd className="px-2 py-1.5 text-xs font-semibold text-foreground bg-muted border rounded-lg">Cmd</kbd> on Mac) and click on cards to open them in new tabs without leaving this page.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {handles.map(handle => (
                <ContentHandleCard 
                  key={handle._id as string} 
                  handle={handle} 
                  onHandleDeleted={onHandleDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
