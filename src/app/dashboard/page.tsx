
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus2, FlaskConical, Edit, MessageSquareMore, Users, Wand2 } from "lucide-react";
import { ROLES } from "@/config/roles";

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

  const isRoot = user?.role === ROLES.ROOT;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <PageWrapper>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Dashboard</CardTitle>
            <CardDescription>Manage your content and platform settings.</CardDescription>
          </CardHeader>
        </Card>

        {(isRoot || isAdmin) && (
          <>
            <h2 className="text-2xl font-semibold mt-8 mb-4">Content Creation</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/dashboard/content-studio" passHref>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      AI Content Studio
                    </CardTitle>
                    <Wand2 className="h-6 w-6 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Generate posts with AI.
                    </p>
                  </CardContent>
                </Card>
              </Link>
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
        )}

        {(isRoot || isAdmin) && (
            <h2 className="text-2xl font-semibold mt-10 mb-4">Management</h2>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isRoot || isAdmin) && (
                <Link href="/dashboard/feedback-management" passHref>
                    <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">
                        Manage Feedback
                        </CardTitle>
                        <MessageSquareMore className="h-6 w-6 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                        View and respond to user feedback.
                        </p>
                    </CardContent>
                    </Card>
                </Link>
            )}
            {isRoot && (
                 <Link href="/dashboard/manage-users" passHref>
                    <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">
                        Manage Users
                        </CardTitle>
                        <Users className="h-6 w-6 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                        View users and manage their roles.
                        </p>
                    </CardContent>
                    </Card>
                </Link>
            )}
        </div>

        {user?.role === ROLES.USER && (
          <Card>
            <CardHeader>
              <CardTitle>User Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Welcome to your dashboard! View your profile and submitted feedback.
              </p>
              <div className="mt-4 space-x-3">
                <Button asChild>
                    <Link href="/profile">View Profile</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/profile/my-feedback">My Feedback</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
