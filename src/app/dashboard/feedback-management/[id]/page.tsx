
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { IFeedback, FeedbackStatus } from "@/models/Feedback";
import { Loader2, AlertCircle, ArrowLeft, Send } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/config/roles";

const allowedFeedbackStatuses: [FeedbackStatus, ...FeedbackStatus[]] = ["New", "In Progress", "Resolved", "Closed"];

const responseFormSchema = z.object({
  adminResponse: z.string().trim().optional(),
  status: z.enum(allowedFeedbackStatuses, { required_error: "Please select a status."}),
});
type ResponseFormValues = z.infer<typeof responseFormSchema>;

export default function FeedbackDetailPageAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id as string;
  const { toast } = useToast();

  const [feedbackItem, setFeedbackItem] = useState<IFeedback | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      adminResponse: "",
      status: "New",
    },
  });

  const canManageFeedback = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (!authLoading) {
      if (!canManageFeedback) {
        router.push("/dashboard");
      } else if (feedbackId) {
        fetchFeedbackItem();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, feedbackId, canManageFeedback]);

  const fetchFeedbackItem = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch feedback item");
      }
      const data: IFeedback = await response.json();
      setFeedbackItem(data);
      form.reset({
        adminResponse: data.adminResponse || "",
        status: data.status,
      });
    } catch (err) {
      console.error("Error fetching feedback item:", err);
      setError((err as Error).message);
    } finally {
      setIsLoadingData(false);
    }
  };

  async function onSubmit(data: ResponseFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update feedback');
      }
      const updatedItem = await response.json();
      setFeedbackItem(updatedItem.feedback);
      toast({
        title: "Feedback Updated",
        description: "Your response and status update have been saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (authLoading || isLoadingData || (!authLoading && !canManageFeedback)) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Card className="border-destructive bg-destructive/10 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/feedback-management">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Link>
            </Button>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }
  
  if (!feedbackItem) {
    return (
      <PageWrapper>
        <p className="text-center text-muted-foreground">Feedback item not found.</p>
         <Button asChild variant="outline" className="mt-4 mx-auto block w-fit">
            <Link href="/dashboard/feedback-management">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Link>
        </Button>
      </PageWrapper>
    );
  }


  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto space-y-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link href="/dashboard/feedback-management">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Feedback
          </Link>
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-headline">{feedbackItem.subject}</CardTitle>
                <Badge variant={feedbackItem.status === "New" ? "secondary" : feedbackItem.status === "Resolved" || feedbackItem.status === "Closed" ? "default" : "outline"} className="capitalize text-sm">
                    {feedbackItem.status}
                </Badge>
            </div>
            <CardDescription>
              Type: {feedbackItem.feedbackType} &bull; Submitted: {format(new Date(feedbackItem.createdAt), "PPP p")}
            </CardDescription>
             <CardDescription>
              By: {feedbackItem.nameAtSubmission} ({feedbackItem.emailAtSubmission})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-1 text-foreground/90">User's Message:</h3>
            <p className="whitespace-pre-wrap text-foreground/80 bg-muted p-3 rounded-md">{feedbackItem.message}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Respond & Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="adminResponse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Response</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your response here..."
                          className="resize-y min-h-[120px]"
                          {...field}
                          value={field.value ?? ""}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Update Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedFeedbackStatuses.map(stat => (
                            <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isSubmitting ? "Saving..." : "Save Response & Status"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
