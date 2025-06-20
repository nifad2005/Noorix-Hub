
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Tag, Package, ShieldCheck, Pencil, Trash2 } from 'lucide-react';
import type { IProduct } from '@/models/Product';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; 
import { useState } from 'react';
import { ROLES } from '@/config/roles';

interface ProductCardProps {
  product: Partial<IProduct> & { _id: string; snippet?: string; };
  onProductDeleted?: (productId: string) => void;
}

export function ProductCard({ product, onProductDeleted }: ProductCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const canManage = user?.role === ROLES.ROOT || user?.role === ROLES.ADMIN;

  const formattedDate = product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date N/A';

  const handleDelete = async () => {
    if (!product._id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      toast({
        title: "Product Deleted",
        description: `Product "${product.title}" has been deleted.`,
      });
      if (onProductDeleted) {
        onProductDeleted(product._id);
      } else {
        router.refresh(); 
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Deletion Failed",
        description: (error as Error).message || "Could not delete the product.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out group relative">
      {canManage && (
        <div className="absolute top-2 right-2 z-10 flex space-x-1 bg-card p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link href={`/dashboard/edit-product/${product._id}`} passHref>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Product</span>
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="h-7 w-7" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete Product</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  "{product.title}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="md:w-32 md:shrink-0 bg-muted flex items-center justify-center p-4 md:p-0">
        <Package className="h-16 w-16 text-primary opacity-70" />
      </div>
      <div className="flex flex-col flex-grow">
        <CardHeader className="p-4 pb-2">
          <div className="flex flex-wrap gap-2 mb-1 items-center">
              {product.category && (
              <Badge variant="secondary" className="text-xs uppercase">{product.category}</Badge>
              )}
              {product.status && (
              <Badge variant={product.status === 'featured' ? 'default' : 'outline'} className="text-xs capitalize">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {product.status}
              </Badge>
              )}
          </div>
          <Link href={`/products/${product._id}`} passHref className="block">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors cursor-pointer">
              {product.title || 'Untitled Product'}
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0 space-y-2">
          <CardDescription className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
            {product.snippet || 'No description available.'}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 pt-2 border-t mt-auto">
          <div className="w-full space-y-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 items-center text-xs text-muted-foreground">
                <Tag className="mr-1 h-3.5 w-3.5" />
                {product.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="px-1.5 py-0.5 text-xs">{tag}</Badge>
                ))}
                {product.tags.length > 3 && <span className="text-xs">+{product.tags.length - 3} more</span>}
              </div>
            )}
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
