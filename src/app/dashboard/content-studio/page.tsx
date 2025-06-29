
"use client";

import { useState } from "react";
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
import { Loader2, Wand2, FileText, Sparkles } from "lucide-react";
import { generateContent, type ContentGeneratorOutput } from "@/ai/flows/content-generator-flow";

const allowedCategories = ["WEB DEVELOPMENT", "ML", "AI"] as const;

const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(50, { message: "Content must be at least 50 characters." }),
  featuredImage: z.string().url().optional().or(z.literal('')),
  category: z.enum(allowedCategories, { required_error: "Please select a category." }),
  tags: z.string().min(2, { message: "Please add at least one tag." }),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export default function ContentStudioPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [contentGenerated, setContentGenerated] = useState(false);

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

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt is empty", description: "Please enter a topic to generate content.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setContentGenerated(false);
    try {
      const result: ContentGeneratorOutput = await generateContent({
        topic: prompt,
        contentType: "blog",
      });
      
      form.setValue("title", result.title);
      form.setValue("content", result.body);
      form.setValue("tags", result.suggestedTags.join(", "));
      setContentGenerated(true);

      toast({
        title: "Content Generated!",
        description: "The AI has created a draft for you. Review and save it.",
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({
        title: "Generation Failed",
        description: "The AI could not generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSaveSubmit(data: BlogFormValues) {
    setIsSaving(true);
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      toast({ title: "Blog Post Saved!", description: "Your new post is live." });
      form.reset();
      setPrompt("");
      setContentGenerated(false);
    } catch (error) {
      console.error("Failed to save post:", error);
      toast({ title: "Save Failed", description: "Could not save the blog post.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <Wand2 className="mr-3 h-8 w-8 text-primary" /> Content Studio
          </h1>
          <p className="text-muted-foreground">
            Generate full blog post drafts from a simple idea and publish them instantly.
          </p>
        </header>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center"><Sparkles className="mr-2 h-5 w-5 text-amber-500" />1. Generate Draft with AI</CardTitle>
            <CardDescription>Enter a topic or a detailed prompt, and let the AI create a blog post draft for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., 'Write a blog post about the key differences between server components and client components in Next.js 14, targeting an intermediate developer audience.'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
              disabled={isGenerating}
            />
            <Button onClick={handleGenerateContent} disabled={isGenerating || !prompt}>
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
          </CardContent>
        </Card>

        <Card className={`shadow-xl transition-opacity duration-500 ${contentGenerated ? 'opacity-100' : 'opacity-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />2. Review & Publish Blog Post</CardTitle>
            <CardDescription>Edit the generated content below and save it to publish on your Noorix Hub blog.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSaveSubmit)} className="space-y-6">
                <fieldset disabled={!contentGenerated || isSaving} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Title</FormLabel>
                        <FormControl>
                          <Input placeholder="AI-generated title will appear here" {...field} />
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
                            placeholder="AI-generated content will appear here..."
                            className="resize-y min-h-[250px]"
                            {...field}
                          />
                        </FormControl>
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
                          <Input type="url" placeholder="https://example.com/image.png" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Input placeholder="e.g., nextjs, react, ai" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </fieldset>
                <Button type="submit" disabled={!contentGenerated || isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSaving ? "Saving Post..." : "Save Post"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
