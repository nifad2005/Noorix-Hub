
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Tag, Package, ShieldCheck } from 'lucide-react'; // Added ShieldCheck for status
import type { IProduct } from '@/models/Product';

interface ProductCardProps {
  product: Partial<IProduct> & { _id: string; snippet?: string; };
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedDate = product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Date N/A';

  return (
    <Link href={`/products/${product._id}`} passHref>
      <Card className="h-full flex flex-col md:flex-row overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out group">
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
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
              {product.title || 'Untitled Product'}
            </CardTitle>
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
    </Link>
  );
}
