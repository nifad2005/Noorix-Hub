
"use client";

import { useState, useEffect } from 'react';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import DynamicIcon from '@/components/icons/DynamicIcon';

interface ContentTool {
  _id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
}

export default function ContentStudioHubPage() {
  const [tools, setTools] = useState<ContentTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/content-tools/list');
        if (!response.ok) {
          throw new Error('Failed to fetch content creation tools.');
        }
        const data = await response.json();
        setTools(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  return (
    <PageWrapper>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Content Studio
          </h1>
          <p className="text-muted-foreground">
            Select a tool to start creating content for your platforms.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
           <Card className="border-destructive bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> Error Loading Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link key={tool.title} href={tool.href} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer">
                  <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all group cursor-pointer">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <DynamicIcon name={tool.icon} className="h-6 w-6 text-primary" />
                        {tool.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                      <div className="flex items-center text-sm font-medium text-primary mt-4 group-hover:gap-2 transition-all">
                        Start Creating <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
