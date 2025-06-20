
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IFeedback } from "@/models/Feedback";
import { Loader2, AlertCircle, Inbox, Eye } from "lucide-react";
import { format } from "date-fns";
import { ROLES } from "@/config/roles";

export default function FeedbackManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [feedbackItems, setFeedbackItems] = useState<IFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canManageFeedback = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (!authLoading) {
      if (!canManageFeedback) {
        router.push("/dashboard"); 
      } else {
        fetchFeedback();
      }
    }
  }, [user, authLoading, router, canManageFeedback]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback/list");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch feedback");
      }
      const data = await response.json();
      setFeedbackItems(data.feedbackItems || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (!authLoading && !canManageFeedback)) {
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
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Feedback Management</CardTitle>
            <CardDescription>View, manage, and respond to user feedback.</CardDescription>
          </CardHeader>
        </Card>

        {isLoading && (
          <div className="flex justify-center items-center py-10">
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
              <Button onClick={fetchFeedback} variant="destructive" className="mt-2">Try again</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && feedbackItems.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">No feedback submissions yet.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && feedbackItems.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitter</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackItems.map((item) => (
                    <TableRow key={item._id as string}>
                      <TableCell className="font-medium">{item.nameAtSubmission}</TableCell>
                      <TableCell className="text-muted-foreground">{item.emailAtSubmission}</TableCell>
                      <TableCell>{item.feedbackType}</TableCell>
                      <TableCell className="truncate max-w-xs">{item.subject}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "New" ? "secondary" : item.status === "Resolved" || item.status === "Closed" ? "default" : "outline"} className="capitalize">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(item.createdAt), "dd MMM yyyy, HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/feedback-management/${item._id}`}>
                            <Eye className="mr-1 h-4 w-4" /> View/Respond
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
