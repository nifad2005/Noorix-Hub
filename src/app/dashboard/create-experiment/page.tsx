
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";
const allowedCategories = ["WEB DEVELOPMENT", "ML", "AI"] as const;

const experimentFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
  tryHereLink: z.string().url({ message: "Please enter a valid URL." }),
  youtubeVideoLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  category: z.enum(allowedCategories, { required_error: "Please select a category." }),
  tags: z.string().min(2, { message: "Please add at least one tag." }).max(100),
});

type ExperimentFormValues = z.infer<typeof experimentFormSchema>;

export default function CreateExperimentPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExperimentFormValues>({
    resolver: zodResolver(experimentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tryHereLink: "",
      youtubeVideoLink: "",
      category: undefined,
      tags: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user?.email !== ADMIN_EMAIL) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create experiments.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [user, authLoading, router, toast]);

  async function onSubmit(data: ExperimentFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create experiment');
      }

      const result = await response.json();
      toast({
        title: "Experiment Created!",
        description: "Your new experiment has been saved successfully.",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to submit experiment:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not save the experiment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || (!authLoading && user?.email !== ADMIN_EMAIL)) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create New Experiment</CardTitle>
          <CardDescription>Share the details of your new experiment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter experiment title" {...field} disabled={isSubmitting} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experiment"
                        className="resize-y min-h-[100px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tryHereLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Try Here Link / Source Code</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/results-or-code" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Link to results, demo, or code repository.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="youtubeVideoLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Video Link (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://youtube.com/watch?v=..." {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WEB DEVELOPMENT">WEB DEVELOPMENT</SelectItem>
                          <SelectItem value="ML">ML</SelectItem>
                          <SelectItem value="AI">AI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., research, data-analysis, frontend" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Comma-separated list of tags.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                 {isSubmitting ? "Submitting..." : "Create Experiment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
