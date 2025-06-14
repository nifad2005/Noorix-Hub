
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import type { IProduct } from "@/models/Product";
import connectDB from "@/lib/db"; // Import connectDB
import ProductModel from "@/models/Product"; // Import Mongoose model
import { ExternalLink } from "lucide-react";

type ProductSummary = Partial<IProduct> & { _id: string; snippet?: string; };

async function getFeaturedProducts(): Promise<ProductSummary[]> {
  console.log(`[getFeaturedProducts DB] Attempting to fetch featured products from DB.`);
  try {
    await connectDB();
    const products = await ProductModel.find({ status: 'featured' })
      .select({
        title: 1,
        description: { $substrCP: ['$description', 0, 150] }, // Snippet
        category: 1,
        tags: 1,
        status: 1,
        createdAt: 1,
        _id: 1,
      })
      .sort({ createdAt: -1 })
      .limit(4) // Limit to 4 featured products
      .lean<IProduct[]>(); // Use .lean() for better performance and plain JS objects

    const formattedProducts = products.map(product => ({
      ...JSON.parse(JSON.stringify(product)), // Ensure plain object
      snippet: product.description, // description here is already the snippet due to select
      description: undefined, // remove the original description field from the response
    }));
    
    console.log(`[getFeaturedProducts DB] Successfully fetched ${formattedProducts.length} featured products.`);
    return formattedProducts;
  } catch (error) {
    console.error(`[getFeaturedProducts DB] Error fetching featured products:`, error);
    return []; // Return empty array on error
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
