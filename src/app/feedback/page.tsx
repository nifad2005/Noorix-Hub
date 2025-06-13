
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
import { MessageSquareHeart, Bug, Lightbulb } from "lucide-react";
import type { FeedbackType } from "@/models/Feedback";

const allowedFeedbackTypes: [FeedbackType, ...FeedbackType[]] = ["General Comment", "Bug Report", "Feature Request"];

const feedbackFormSchema = z.object({
  feedbackType: z.enum(allowedFeedbackTypes, {
    required_error: "Please select a feedback type.",
  }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }).max(150),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(2000),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      feedbackType: "General Comment",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      router.push("/login?callbackUrl=/feedback");
    }
  }, [isAuthenticated, authLoading, router, toast]);

  async function onSubmit(data: FeedbackFormValues) {
    if (!user || !user.id || !user.name || !user.email) {
        toast({
            title: "User data missing",
            description: "Could not retrieve your user details. Please try logging in again.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        userId: user.id,
        nameAtSubmission: user.name,
        emailAtSubmission: user.email,
      };
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      await response.json();
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. We appreciate you taking the time to help us improve.",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not submit your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || (!authLoading && !isAuthenticated)) {
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
        <CardHeader className="text-center">
          <MessageSquareHeart className="mx-auto h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-headline">Share Your Feedback</CardTitle>
          <CardDescription>We value your input! Let us know how we can improve.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="feedbackType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Feedback</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="General Comment">
                          <div className="flex items-center">
                            <MessageSquareHeart className="mr-2 h-4 w-4 text-muted-foreground" /> General Comment
                          </div>
                        </SelectItem>
                        <SelectItem value="Bug Report">
                           <div className="flex items-center">
                            <Bug className="mr-2 h-4 w-4 text-muted-foreground" /> Bug Report
                           </div>
                        </SelectItem>
                        <SelectItem value="Feature Request">
                          <div className="flex items-center">
                            <Lightbulb className="mr-2 h-4 w-4 text-muted-foreground" /> Feature Request
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Issue with login button" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide as much detail as possible..."
                        className="resize-y min-h-[150px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <div className="text-sm text-muted-foreground">
                Submitting as: <strong>{user?.name}</strong> ({user?.email})
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || authLoading}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

