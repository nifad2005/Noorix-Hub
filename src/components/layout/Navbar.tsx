
"use client";

import Link from "next/link";
import React, { useState } from "react"; 
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, Menu, ChevronDown, LogIn, MessageSquareHeart, Mail } from "lucide-react";
import { ROLES } from "@/config/roles"; // Import ROLES

export function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  let hoverTimeout: NodeJS.Timeout | null = null;

  const handleMoreMenuOpen = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsMoreMenuOpen(true);
  };

  const handleMoreMenuClose = () => {
    hoverTimeout = setTimeout(() => {
      setIsMoreMenuOpen(false);
    }, 200); 
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/experiments", label: "Experiments" },
    { href: "/blogs", label: "Blogs" },
  ];

  const moreLinks = [
    { href: "/about", label: "About Us" },
    { href: "/feedback", label: "Feedback" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <Button variant="ghost" asChild><span>{link.label}</span></Button>
              </Link>
            ))}
            <DropdownMenu open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="group flex items-center"
                  onMouseEnter={handleMoreMenuOpen}
                  onMouseLeave={handleMoreMenuClose}
                >
                  More
                  <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72" 
                onMouseEnter={handleMoreMenuOpen} 
                onMouseLeave={handleMoreMenuClose} 
              >
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link href={link.href} className="w-full flex justify-start">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-2">
            {loading ? (
              <div className="w-28 h-8 bg-muted rounded animate-pulse"></div> // Adjusted width for potential role text
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-2"> {/* Container for role and dropdown */}
                {(user.role === ROLES.ROOT || user.role === ROLES.ADMIN) && (
                  <span className="text-xs text-primary font-medium uppercase">
                    {user.role}
                  </span>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "User"} />
                        <AvatarFallback>{getInitials(user.name || undefined)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {/* Role removed from here */}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/my-feedback">
                        <MessageSquareHeart className="mr-2 h-4 w-4" />
                        My Feedback
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login">
                <Button asChild><span>Login</span></Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Trigger and Content */}
          <div className="md:hidden flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {/* Role removed from here */}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                {[...navLinks, ...moreLinks].map((link) => (
                  <DropdownMenuItem key={link.label} asChild>
                    <Link href={link.href} className="w-full flex justify-start">{link.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {isAuthenticated && user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full flex justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/profile/my-feedback" className="w-full flex justify-start">
                        <MessageSquareHeart className="mr-2 h-4 w-4" />
                        My Feedback
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="w-full flex justify-start">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="w-full flex justify-start cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full flex justify-start">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

