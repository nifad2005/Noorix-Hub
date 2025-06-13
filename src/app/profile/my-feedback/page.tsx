
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IFeedback } from "@/models/Feedback";
import { Loader2, MessageSquareText, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function MyFeedbackPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [feedbackItems, setFeedbackItems] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchFeedback();
    }
  }, [authLoading, isAuthenticated]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback/my-feedback");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch feedback");
      }
      const data = await response.json();
      setFeedbackItems(data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
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
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Submitted Feedback</h1>
          <p className="text-muted-foreground">
            Track the feedback you've provided and see responses from our team.
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <button onClick={fetchFeedback} className="mt-2 text-sm text-destructive underline">Try again</button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && feedbackItems.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquareText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">You haven't submitted any feedback yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'd love to hear from you! Visit the <a href="/feedback" className="underline text-primary">Feedback Page</a> to share your thoughts.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && feedbackItems.length > 0 && (
          <div className="space-y-6">
            {feedbackItems.map((item) => (
              <Card key={item._id as string} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-semibold">{item.subject}</CardTitle>
                    <Badge variant={item.status === "New" ? "secondary" : item.status === "Resolved" || item.status === "Closed" ? "default" : "outline"} className="capitalize">
                      {item.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    Submitted on {format(new Date(item.createdAt), "PPP p")} &bull; Type: {item.feedbackType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-foreground/90">{item.message}</p>
                  {item.adminResponse && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-sm font-semibold text-primary mb-1">Admin Response:</h4>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{item.adminResponse}</p>
                      <p className="text-xs text-muted-foreground mt-1">Responded on {format(new Date(item.updatedAt), "PPP p")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
