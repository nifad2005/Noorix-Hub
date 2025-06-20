
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
import { ROLES } from "@/config/roles";
import { Loader2 } from "lucide-react";

const allowedCategories = ["WEB DEVELOPMENT", "ML", "AI"] as const;

const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(150),
  content: z.string().min(50, { message: "Content must be at least 50 characters." }),
  featuredImage: z.string().url({ message: "Please enter a valid URL for the featured image."}).optional().or(z.literal('')),
  category: z.enum(allowedCategories, { required_error: "Please select a category." }),
  tags: z.string().min(2, { message: "Please add at least one tag." }).max(100),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function CreateBlogPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      featuredImage: "",
      category: undefined, 
      tags: "",
    },
  });

  const canManageContent = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (!authLoading && !canManageContent) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create blog posts.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [user, authLoading, router, toast, canManageContent]);


  async function onSubmit(data: BlogFormValues) {
    setIsSubmittingForm(true);
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog post');
      }

      await response.json();
      toast({
        title: "Blog Post Published!",
        description: "Your new blog post has been saved successfully.",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to submit blog post:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not save the blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingForm(false);
    }
  }

  if (authLoading || (!authLoading && !canManageContent)) {
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
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Write New Blog Post</CardTitle>
          <CardDescription>Share your thoughts and insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your blog post title" {...field} disabled={isSubmittingForm} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your blog post here... Markdown is not yet supported, but plain text is fine!"
                        className="resize-y min-h-[250px]"
                        {...field}
                        disabled={isSubmittingForm}
                      />
                    </FormControl>
                    <FormDescription>
                      You can expand this later to support Markdown or a rich text editor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.png" {...field} disabled={isSubmittingForm} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmittingForm}>
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
                        <Input placeholder="e.g., nextjs, coding, guide" {...field} disabled={isSubmittingForm}/>
                      </FormControl>
                      <FormDescription>Comma-separated.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmittingForm || form.formState.isSubmitting}>
                {isSubmittingForm || form.formState.isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
