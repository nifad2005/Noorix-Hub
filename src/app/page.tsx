
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { IProduct } from "@/models/Product";
import { ExternalLink } from "lucide-react";

type ProductSummary = Partial<IProduct> & { _id: string; snippet?: string; };

async function getFeaturedProducts(): Promise<ProductSummary[]> {
  let domain = process.env.NEXT_PUBLIC_DOMAIN;
  // For Vercel deployments, VERCEL_URL is automatically set for preview/production.
  // For local development, it falls back to NEXT_PUBLIC_DOMAIN or localhost.
  if (process.env.VERCEL_URL) {
    domain = `https://${process.env.VERCEL_URL}`;
  } else if (!domain && process.env.NODE_ENV === 'development') {
    domain = 'http://localhost:9002'; // Default for local dev if NEXT_PUBLIC_DOMAIN is not set
  } else if (!domain) {
    // Fallback for other environments or if NEXT_PUBLIC_DOMAIN is crucial and missing
    console.warn("Warning: NEXT_PUBLIC_DOMAIN environment variable is not set. Fetching might fail.");
    // Attempt with a relative path, though this is less reliable for server components in some setups.
    // Or handle error / return empty. For now, let's log and proceed with undefined domain for API call.
  }


  const fetchUrl = `${domain}/api/products/list?status=featured&limit=4`;

  try {
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch featured products: ${res.statusText} (status: ${res.status}) from ${fetchUrl}`);
      return []; // Return empty array on error
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
