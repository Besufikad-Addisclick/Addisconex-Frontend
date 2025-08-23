"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import dynamic from 'next/dynamic';

const AdsSection = dynamic(() => import('@/components/ads/AdsSection'), { ssr: false });

// Define the interface for post data
interface Post {
  id: string | number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

// Define the interface for the paginated API response
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: string;
    title: string;
    content: string;
    image: string;
    author: {
      first_name: string;
      last_name: string;
    };
    date: string;
    category: string;
    read_time: string;
  }>;
}

// Static dummy data as fallback
const blogPosts: Post[] = [
  {
    id: 1,
    title: 'The Future of Construction Material Procurement',
    excerpt: 'Discover how digital platforms are revolutionizing the construction material procurement process and what it means for the industry...',
    image: 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg',
    author: 'John Doe',
    date: '2025-04-28',
    category: 'Industry Trends',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Sustainable Construction Materials: A Complete Guide',
    excerpt: 'Learn about eco-friendly construction materials and their impact on sustainable building practices in the modern construction industry...',
    image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg',
    author: 'Jane Smith',
    date: '2025-04-27',
    category: 'Sustainability',
    readTime: '7 min read'
  },
  {
    id: 3,
    title: 'Price Trends in Ethiopian Construction Market',
    excerpt: 'Analysis of current price trends and future projections in the Ethiopian construction industry, with insights from leading experts...',
    image: 'https://images.pexels.com/photos/2760241/pexels-photo-2760241.jpeg',
    author: 'Michael Johnson',
    date: '2025-04-26',
    category: 'Market Analysis',
    readTime: '6 min read'
  }
];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch news articles
  useEffect(() => {
    const fetchNewsArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          page_size: '10',
          ...(searchQuery && { search: searchQuery }),
        });
        const response = await fetch(`/api/news?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch news articles');
        }

        const data: PaginatedResponse = await response.json();
        const fetchedPosts: Post[] = data.results.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.content
            .replace(/<[^>]+>/g, '')
            .split(' ')
            .slice(0, 20)
            .join(' ')
            .concat('...'),
          image: article.image,
          author: `${article.author.first_name} ${article.author.last_name}`,
          date: article.date,
          category: article.category,
          readTime: article.read_time,
        }));

        setPosts(prev => (page === 1 ? fetchedPosts : [...prev, ...fetchedPosts]));
        setHasMore(!!data.next);
      } catch (error: any) {
        console.error('[BlogPage] Fetch error:', error.message);
        setError(error.message);
        setPosts(page === 1 ? blogPosts : posts); // Fallback to static data only on first page
      } finally {
        setLoading(false);
      }
    };

    fetchNewsArticles();
  }, [page, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on new search
    setPosts([]); // Clear posts for new search
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Hero Section */}
              <div className="bg-white py-16 mb-12 rounded-lg shadow-sm">
                <div className="max-w-3xl mx-auto text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    Construction Industry Insights
                  </h1>
                  <p className="text-lg text-gray-600 mb-8">
                    Stay updated with the latest trends, analysis, and insights in the construction industry.
                  </p>
                  <div className="relative max-w-xl mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-8">
                  <p className="text-red-500 text-center">{error}</p>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                        <div className="w-full h-48 bg-gray-200" />
                        <div className="p-6">
                          <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
                          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
                          <div className="h-4 w-full bg-gray-200 rounded mb-4" />
                          <div className="flex items-center gap-4 mt-4">
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </div>
                          <div className="h-8 w-24 bg-gray-200 rounded mt-6 mx-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Posts Grid */}
              {!loading && posts.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {posts.map((post, index) => (
                      <motion.article
                        key={`${post.id}-${index}`} // Unique key to handle duplicates
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg shadow-lg overflow-hidden"
                      >
                        <Link href={`/blog/${post.id}`}>
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        <div className="p-6">
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                              {post.category}
                            </span>
                          </div>
                          <Link href={`/blog/${post.id}`}>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                              {post.title}
                            </h2>
                          </Link>
                          <p className="text-gray-600 mb-4">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="h-4 w-4 mr-2" />
                              <span>{post.author}</span>
                              <Calendar className="h-4 w-4 ml-4 mr-2" />
                              <span>{new Date(post.date).toLocaleDateString()}</span>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/blog/${post.id}`}>
                                Read More
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load More'}
                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* No Results Message */}
              {!loading && posts.length === 0 && !error && (
                <div className="text-center">
                  <p className="text-gray-600">No articles found.</p>
                </div>
              )}
            </div>

            {/* Sidebar AdsSection */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <AdsSection className="mt-0 lg:mt-16" title="Sponsored" display_location="ad_sections" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
