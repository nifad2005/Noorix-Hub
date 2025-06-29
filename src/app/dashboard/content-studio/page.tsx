
"use client";

import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";
import Link from "next/link";

const creationTools = [
  {
    title: "AI-Powered Blog Post",
    description: "Generate a complete blog post draft from a simple topic or prompt.",
    href: "/dashboard/content-studio/blog",
    Icon: Edit,
  },
  // Add more tools here in the future
  // {
  //   title: "Facebook Post",
  //   description: "Create engaging posts for your Facebook page.",
  //   href: "/dashboard/content-studio/facebook",
  //   Icon: Facebook,
  // },
];

export default function ContentStudioHubPage() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creationTools.map((tool) => (
            <Link key={tool.title} href={tool.href} passHref>
              <Card className="h-full hover:shadow-xl hover:border-primary/50 transition-all group cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <tool.Icon className="h-6 w-6 text-primary" />
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
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
