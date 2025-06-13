
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";
import Image from "next/image";

const contactFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).max(100),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.email) {
      form.reset({
        email: user.email,
      });
    } else if (!authLoading && !isAuthenticated) {
        form.reset({ email: ""}); // Clear email if not authenticated
    }
  }, [isAuthenticated, authLoading, user, form]);

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }), // Send only email
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send contact request');
      }

      await response.json();
      toast({
        title: "Request Sent!",
        description: "Thank you! We'll get back to you at the email provided shortly.",
      });
      // Reset email field or keep pre-filled if logged in
      form.reset({
        email: (isAuthenticated && user?.email) || "",
      });

    } catch (error) {
      console.error("Failed to send contact request:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not send your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageWrapper>
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Image 
            src="https://placehold.co/150x100.png" 
            alt="Contact illustration" 
            width={150} 
            height={100} 
            className="rounded-lg mx-auto mb-4"
            data-ai-hint="email envelope"
          />
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <Mail className="mr-3 h-8 w-8 text-primary" /> Contact Us
          </CardTitle>
          <CardDescription>Have questions or want to get in touch? Just leave your email and we'll reach out.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Your Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting || (isAuthenticated && !!user?.email)} />
                    </FormControl>
                    {isAuthenticated && user?.email && (
                        <p className="text-xs text-muted-foreground">You are logged in. We will use your account email: {user.email}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || authLoading}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Email"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
