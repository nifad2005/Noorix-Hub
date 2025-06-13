
"use client";

import { useAuth } from "@/hooks/useAuth"; // We can continue to use our useAuth hook
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth(); // login from useAuth will now trigger next-auth's signIn
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/profile"); // Redirect if already authenticated
    }
  }, [isAuthenticated, loading, router]);

  const handleGoogleSignIn = () => {
    login(); // Call the login function from our AuthContext
  };

  if (loading || (!loading && isAuthenticated)) {
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
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
             <div className="mx-auto mb-6">
                <Image 
                  src="https://placehold.co/150x100.png" 
                  alt="Login illustration" 
                  width={150} 
                  height={100} 
                  className="rounded-lg"
                  data-ai-hint="secure lock"
                />
            </div>
            <CardTitle className="text-3xl font-headline">Welcome Back!</CardTitle>
            <CardDescription>Sign in to access your Noorix Hub account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full text-base py-6"
              variant="outline"
            >
              <GoogleIcon className="mr-3" />
              Sign in with Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
