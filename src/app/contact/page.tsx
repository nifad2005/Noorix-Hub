
"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, Facebook, Youtube, Link as LinkIcon, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CONTACT_EMAIL = "nifaduzzaman2005@gmail.com";
const FACEBOOK_URL = "https://www.facebook.com/noorix.startup";
const YOUTUBE_URL = "https://www.youtube.com/@noorix.startup";

export default function ContactPage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      toast({
        title: "Email Copied!",
        description: `${CONTACT_EMAIL} has been copied to your clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy email: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy email. Please try again manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <MessageCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <CardTitle className="text-3xl font-headline flex items-center justify-center">
              <Mail className="mr-3 h-8 w-8 text-primary" /> Get In Touch
            </CardTitle>
            <CardDescription>
              The best way to reach us is via email or through our social channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                For inquiries, support, or collaborations, please email us at:
              </p>
              <div className="flex items-center justify-center p-3 border rounded-md bg-muted">
                <span className="text-lg font-medium text-primary break-all">{CONTACT_EMAIL}</span>
              </div>
              <Button onClick={handleCopyEmail} className="w-full mt-2" variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Email Copied!" : "Copy Email Address"}
              </Button>
            </div>

            <div className="text-center space-y-3 pt-4">
              <h3 className="text-md font-semibold text-muted-foreground">Connect with us on social media:</h3>
              <div className="flex justify-center space-x-4">
                <Button asChild variant="outline" size="lg">
                  <Link href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Noorix Startup on Facebook">
                    <Facebook className="mr-2 h-5 w-5" /> Facebook
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="Noorix Startup on YouTube">
                    <Youtube className="mr-2 h-5 w-5" /> YouTube
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
