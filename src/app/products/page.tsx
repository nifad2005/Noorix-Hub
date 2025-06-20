
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/product/ProductCard';
import type { IProduct } from '@/models/Product';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2, Search } from 'lucide-react';

type ProductSummary = Partial<IProduct> & { _id: string; snippet?: string; };

const ITEMS_PER_PAGE = 9;
const CATEGORIES = ["All", "WEB DEVELOPMENT", "ML", "AI"];

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allStatuses, setAllStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchDistinctTags = useCallback(async () => {
    try {
      const response = await fetch('/api/products/distinct-tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const tagsData = await response.json();
      setAllTags(['All', ...tagsData.filter((tag: string | null) => tag)]);
    } catch (error) {
      console.error("Error fetching distinct product tags:", error);
      setAllTags(['All']);
    }
  }, []);

  const fetchDistinctStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/products/distinct-statuses');
      if (!response.ok) throw new Error('Failed to fetch statuses');
      const statusesData = await response.json();
      setAllStatuses(['All', ...statusesData.filter((status: string | null) => status)]);
    } catch (error) {
      console.error("Error fetching distinct product statuses:", error);
      setAllStatuses(['All']);
    }
  }, []);

  const fetchProducts = useCallback(async (page: number, search: string, category: string, tag: string, status: string, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });
    if (search) params.set('search', search);
    if (category && category !== 'All') params.set('category', category);
    if (tag && tag !== 'All') params.set('tag', tag);
    if (status && status !== 'All') params.set('status', status);

    try {
      const response = await fetch(`/api/products/list?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      const data = await response.json();
      
      setProducts(prevProducts => append ? [...prevProducts, ...data.products] : data.products);
      setCurrentPage(data.currentPage);
      setHasMore(data.hasMore);

    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (append) setLoadingMore(false); else setLoading(false);
      if(initialLoad) setInitialLoad(false);
    }
  }, [initialLoad]);

  useEffect(() => {
    fetchDistinctTags();
    fetchDistinctStatuses();
  }, [fetchDistinctTags, fetchDistinctStatuses]);
  
  useEffect(() => {
    setProducts([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchProducts(1, debouncedSearchTerm, selectedCategory, selectedTag, selectedStatus, false);
  }, [debouncedSearchTerm, selectedCategory, selectedTag, selectedStatus, fetchProducts]);

  const handleProductDeleted = (deletedProductId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p._id !== deletedProductId));
    // Optionally, could refetch the current page to ensure data consistency if counts change significantly
    // fetchProducts(currentPage, debouncedSearchTerm, selectedCategory, selectedTag, selectedStatus, false);
  };

  const lastProductElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(currentPage + 1, debouncedSearchTerm, selectedCategory, selectedTag, selectedStatus, true);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, currentPage, debouncedSearchTerm, selectedCategory, selectedTag, selectedStatus, fetchProducts]
  );

  return (
    <PageWrapper>
      <div className="space-y-8">
        <header className="text-center space-y-2 py-8">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Our <span className="text-primary">Products</span>
          </h1>
          <p className="text-xl font-semibold text-muted-foreground max-w-xl mx-auto">
            Explore our latest tools, applications, and digital solutions.
          </p>
        </header>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by title..."
              className="w-full pl-10 pr-4 py-2 text-base rounded-lg shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Tabs value={selectedCategory} onValueChange={(value) => {setSelectedCategory(value); setCurrentPage(1);}} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-sm data-[state=active]:shadow-md">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {allStatuses.length > 1 && (
              <Tabs value={selectedStatus} onValueChange={(value) => {setSelectedStatus(value); setCurrentPage(1);}} className="w-full">
                <TabsList className="flex flex-wrap justify-start gap-2 h-auto py-2">
                  {allStatuses.map(status => (
                    <TabsTrigger key={status} value={status} className="text-xs px-2 py-1 capitalize data-[state=active]:shadow-md">
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {allTags.length > 1 && (
              <Tabs value={selectedTag} onValueChange={(value) => {setSelectedTag(value); setCurrentPage(1);}} className="w-full">
                 <TabsList className="flex flex-wrap justify-start gap-2 h-auto py-2">
                    {allTags.map(tag => (
                    <TabsTrigger key={tag} value={tag} className="text-xs px-2 py-1 data-[state=active]:shadow-md">
                        #{tag}
                    </TabsTrigger>
                    ))}
                </TabsList>
              </Tabs>
            )}
          </div>
        </div>
        
        {initialLoad && loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : products.length === 0 && !loading ? (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((product, index) => {
              const card = <ProductCard key={product._id} product={product} onProductDeleted={handleProductDeleted} />;
              if (products.length === index + 1) {
                return (
                  <div ref={lastProductElementRef} key={product._id}>
                    {card}
                  </div>
                );
              } else {
                return card;
              }
            })}
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-center text-muted-foreground py-6">You've reached the end!</p>
        )}
      </div>
    </PageWrapper>
  );
}
