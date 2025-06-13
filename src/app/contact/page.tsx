
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import Image from "next/image";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  email: z.string().email({ message: "Please enter a valid email address." }).max(100),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }).max(150),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(2000),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        subject: "",
        message: "",
      });
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
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      await response.json();
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you shortly.",
      });
      // Reset to initial state (clear subject/message, keep pre-filled name/email if logged in)
      form.reset({
        name: (isAuthenticated && user?.name) || "",
        email: (isAuthenticated && user?.email) || "",
        subject: "",
        message: "",
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Submission Failed",
        description: (error as Error).message || "Could not send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageWrapper>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <Image 
            src="https://placehold.co/150x100.png" 
            alt="Contact illustration" 
            width={150} 
            height={100} 
            className="rounded-lg mx-auto mb-4"
            data-ai-hint="communication contact"
          />
          <CardTitle className="text-3xl font-headline flex items-center justify-center">
            <Mail className="mr-3 h-8 w-8 text-primary" /> Get In Touch
          </CardTitle>
          <CardDescription>We'd love to hear from you! Send us a message with any questions or inquiries.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Your Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Regarding your services..." {...field} disabled={isSubmitting} />
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
                    <FormLabel className="flex items-center"><MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Your Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please type your message here..."
                        className="resize-y min-h-[150px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || authLoading}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
