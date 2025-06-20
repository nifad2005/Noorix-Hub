
"use client";

import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import Link from "next/link"; // Import Link

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16 container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        A product by{" "}
        <Link
          href="https://noorix.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          NOORIX
        </Link>
        . © {new Date().getFullYear()} Noorix Hub. All rights reserved.
      </footer>
    </div>
  );
}
