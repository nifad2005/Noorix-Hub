
"use client";

import { useAuth } from "@/hooks/useAuth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || (!user && !loading)) { // Check !user directly after loading is false
     return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }
  
  // Ensure user is not null before proceeding
  if (!user) {
    // This case should ideally be caught by the loading || (!user && !loading) check above,
    // or the useEffect redirect. Adding for robustness.
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <p>User data not available. Redirecting...</p>
        </div>
      </PageWrapper>
    );
  }

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <PageWrapper>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-24 w-24 text-3xl">
              {/* user.avatarUrl now comes from Google's user.image via AuthContext */}
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} data-ai-hint="user avatar" />
              <AvatarFallback>{getInitials(user.name || undefined)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <CardTitle className="text-3xl font-headline">{user.name}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
              <Button variant="outline" size="sm" className="mt-4">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Account Details
              </CardTitle>
              <CardDescription>Manage your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.name || ""} disabled />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user.email || ""} disabled />
              </div>
              <Button className="w-full sm:w-auto">Update Information</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Security & Preferences
              </CardTitle>
              <CardDescription>Adjust your security settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div>
                <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
              </div>
              <div>
                 <Button variant="outline" className="w-full sm:w-auto">Notification Settings</Button>
              </div>
               <Separator className="my-4" />
              <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
