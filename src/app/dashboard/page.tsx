
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, FlaskConical, Edit } from "lucide-react"; // Icons for create actions

const ADMIN_EMAIL = "nifaduzzaman2005@gmail.com";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!isAuthenticated) {
    // Should be handled by AuthContext/middleware ideally, but as a fallback:
    return (
      <PageWrapper>
        <div className="text-center py-10">
          <h1 className="text-2xl font-semibold">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to view the dashboard.</p>
          <Link href="/login" passHref>
            <Button className="mt-4">Login</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <PageWrapper>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Dashboard</CardTitle>
            <CardDescription>Manage your content and platform settings.</CardDescription>
          </CardHeader>
        </Card>

        {isAdmin ? (
          <>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Create New Content</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/dashboard/create-product" passHref>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Product
                    </CardTitle>
                    <FilePlus2 className="h-6 w-6 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Add a new product to showcase.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/create-experiment" passHref>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Experiment
                    </CardTitle>
                    <FlaskConical className="h-6 w-6 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Share a new experiment or finding.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/create-blog" passHref>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      Blog Post
                    </CardTitle>
                    <Edit className="h-6 w-6 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Write and publish a new blog article.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Restricted Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You do not have the necessary permissions to create new content.
                Please contact the administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
