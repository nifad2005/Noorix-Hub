
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { IProduct } from "@/models/Product";
import { ExternalLink } from "lucide-react";

type ProductSummary = Partial<IProduct> & { _id: string; snippet?: string; };

async function getFeaturedProducts(): Promise<ProductSummary[]> {
  let determinedDomain: string | undefined;

  if (process.env.VERCEL_URL) {
    determinedDomain = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_DOMAIN) {
    determinedDomain = process.env.NEXT_PUBLIC_DOMAIN.startsWith('http')
      ? process.env.NEXT_PUBLIC_DOMAIN
      : `https://${process.env.NEXT_PUBLIC_DOMAIN}`;
  } else if (process.env.NODE_ENV === 'development') {
    determinedDomain = 'http://localhost:9002';
  }

  if (!determinedDomain) {
    console.error("Error: Could not determine domain for API call in getFeaturedProducts. Ensure VERCEL_URL or NEXT_PUBLIC_DOMAIN is set, or NODE_ENV is 'development' for local fallback.");
    return [];
  }

  const fetchUrl = `${determinedDomain}/api/products/list?status=featured&limit=4`;

  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch featured products: ${res.statusText} (status: ${res.status}) from ${fetchUrl}`);
      return [];
    }
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error(`Fetch error in getFeaturedProducts for URL ${fetchUrl}:`, error);
    return [];
  }
}


export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
        
        <h1 className="text-5xl font-bold tracking-tight font-headline">
          Welcome to <span className="text-primary">Noorix Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Your central platform for innovative tools and experiments. Explore our featured products and dive into the world of X&I.
        </p>
        <div className="flex space-x-4">
          <Link href="/products">
            <Button size="lg">Explore Products</Button>
          </Link>
          <Link href="/about">
             <Button size="lg" variant="outline">About Us</Button>
          </Link>
        </div>
      </div>

      {featuredProducts && featuredProducts.length > 0 && (
        <div id="featured-products" className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">
            Featured <span className="text-primary">Products</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
