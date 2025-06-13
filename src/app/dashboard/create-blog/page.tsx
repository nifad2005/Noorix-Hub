
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(150),
  content: z.string().min(50, { message: "Content must be at least 50 characters." }),
  category: z.string().min(2, { message: "Category is required." }).max(50),
  tags: z.string().min(2, { message: "Please add at least one tag." }).max(100),
  // featuredImage: z.string().url({ message: "Please enter a valid URL for the featured image."}).optional(), // Optional
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function CreateBlogPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      tags: "",
      // featuredImage: "",
    },
  });

  useEffect(() => {
    if (!authLoading && user?.email !== ADMIN_EMAIL) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create blog posts.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [user, authLoading, router, toast]);


  function onSubmit(data: BlogFormValues) {
    console.log(data);
    toast({
      title: "Blog Post Submitted!",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
    form.reset();
  }

  if (authLoading || user?.email !== ADMIN_EMAIL) {
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
                      <Input placeholder="Enter your blog post title" {...field} />
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
                      />
                    </FormControl>
                    <FormDescription>
                      You can expand this later to support Markdown or a rich text editor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Technology, Lifestyle, Tutorial" {...field} />
                      </FormControl>
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
                        <Input placeholder="e.g., nextjs, coding, guide" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Publishing..." : "Publish Post"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
