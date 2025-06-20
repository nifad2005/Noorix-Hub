
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { IProduct, ProductStatus } from "@/models/Product";
import { Loader2 } from "lucide-react";
import { ROLES } from "@/config/roles";

const allowedCategories = ["WEB DEVELOPMENT", "ML", "AI"] as const;
const allowedProductStatuses: [ProductStatus, ...ProductStatus[]] = ["beta", "new released", "featured", "experimental"];

const productFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000),
  tryHereLink: z.string().url({ message: "Please enter a valid URL." }),
  youtubeVideoLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  category: z.enum(allowedCategories, { required_error: "Please select a category." }),
  status: z.enum(allowedProductStatuses, { required_error: "Please select a status."}),
  tags: z.string().max(100).optional().or(z.literal('')), 
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tryHereLink: "",
      youtubeVideoLink: "",
      category: undefined,
      status: undefined,
      tags: "",
    },
  });

  const canManageContent = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (!authLoading && !canManageContent) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit products.",
        variant: "destructive",
      });
      router.push("/dashboard");
    }
  }, [user, authLoading, router, toast, canManageContent]);

  useEffect(() => {
    if (productId && canManageContent) {
      const fetchProduct = async () => {
        setIsLoadingData(true);
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch product data");
          }
          const data: IProduct = await response.json();
          form.reset({
            title: data.title,
            description: data.description,
            tryHereLink: data.tryHereLink,
            youtubeVideoLink: data.youtubeVideoLink || "",
            category: data.category,
            status: data.status,
            tags: data.tags.join(", "),
          });
        } catch (error) {
          console.error("Failed to fetch product:", error);
          toast({
            title: "Error",
            description: "Could not load product data. Please try again.",
            variant: "destructive",
          });
          router.push("/dashboard/create-product"); 
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchProduct();
    } else if (!authLoading && !canManageContent) {
        setIsLoadingData(false);
    }
  }, [productId, user, form, router, toast, canManageContent, authLoading]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      await response.json();
      toast({
        title: "Product Updated!",
        description: "The product has been updated successfully.",
      });
      router.push(`/products/${productId}`); 
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Update Failed",
        description: (error as Error).message || "Could not update the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (authLoading || isLoadingData || (!authLoading && !canManageContent)) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Edit Product</CardTitle>
          <CardDescription>Update the details for this product.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product title" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your product in detail"
                        className="resize-y min-h-[100px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tryHereLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Try Here Link</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/try" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Link to a demo or product page.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="youtubeVideoLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Video Link (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://youtube.com/watch?v=..." {...field} value={field.value ?? ""} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedProductStatuses.map(stat => <SelectItem key={stat} value={stat} className="capitalize">{stat}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., productivity, AI, development" {...field} value={field.value ?? ""} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Comma-separated list of tags.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || form.formState.isSubmitting}>
                {isSubmitting || form.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
