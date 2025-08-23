"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AdsSection = dynamic(() => import('@/components/ads/AdsSection'), { ssr: false });

// Define the interface for the article data
interface Article {
  id: string | number;
  title: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

// Define the interface for the backend response
interface ArticleResponse {
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
}

// Static dummy data as fallback
const blogPost: Article = {
  id: 1,
  title: 'The Future of Construction Material Procurement',
  content: `
    <p>The construction industry is undergoing a significant transformation in how materials are procured. Digital platforms are revolutionizing traditional procurement processes, making them more efficient and cost-effective.</p>
    
    <h2>Digital Transformation in Procurement</h2>
    <p>Digital platforms are streamlining the procurement process by:</p>
    <ul>
      <li>Providing real-time price comparisons</li>
      <li>Enabling direct communication with suppliers</li>
      <li>Offering automated order tracking</li>
      <li>Maintaining digital documentation</li>
    </ul>

    <h2>Benefits of Digital Procurement</h2>
    <p>The adoption of digital procurement solutions offers numerous benefits:</p>
    <ul>
      <li>Reduced procurement costs</li>
      <li>Improved transparency</li>
      <li>Better supplier relationships</li>
      <li>Enhanced efficiency</li>
    </ul>

    <h2>Future Trends</h2>
    <p>Looking ahead, we can expect to see:</p>
    <ul>
      <li>AI-powered procurement optimization</li>
      <li>Blockchain for supply chain transparency</li>
      <li>IoT integration for inventory management</li>
      <li>Predictive analytics for demand forecasting</li>
    </ul>
  `,
  image: 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg',
  author: 'John Doe',
  date: '2025-04-28',
  category: 'Industry Trends',
  readTime: '5 min read'
};

export default function BlogPostDetail() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article>(blogPost);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/news/${articleId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch news article');
        }

        const data: ArticleResponse = await response.json();
        const fetchedArticle: Article = {
          id: data.id,
          title: data.title,
          content: data.content,
          image: data.image,
          author: `${data.author.first_name} ${data.author.last_name}`,
          date: data.date,
          category: data.category,
          readTime: data.read_time,
        };

        setArticle(fetchedArticle);
      } catch (error: any) {
        console.error('[BlogPostDetail] Fetch error:', error.message);
        setError(error.message);
        setArticle(blogPost); // Fallback to static data
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                    <div className="h-12 w-32 bg-gray-200 rounded mt-6 ml-6" />
                    <div className="w-full h-[400px] bg-gray-200" />
                    <div className="p-8">
                      <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
                      <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
                      <div className="flex items-center gap-4 mb-8">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />
                      <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                      <div className="h-8 w-32 bg-gray-200 rounded mt-8" />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="max-w-4xl mx-auto text-center">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <article className="max-w-4xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                  >
                    {/* Back Button */}
                    <Button
                      variant="ghost"
                      className="m-6"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Blog
                    </Button>

                    {/* Featured Image */}
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-[400px] object-cover"
                    />

                    {/* Content */}
                    <div className="p-8">
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                      </div>

                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {article.title}
                      </h1>

                      <div className="flex items-center text-sm text-gray-500 mb-8">
                        <User className="h-4 w-4 mr-2" />
                        <span>{article.author}</span>
                        <Calendar className="h-4 w-4 ml-4 mr-2" />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                        <Clock className="h-4 w-4 ml-4 mr-2" />
                        <span>{article.readTime}</span>
                      </div>

                      {/* Social Share Buttons */}
                      <div className="flex items-center space-x-4 mb-8">
                        <Button variant="outline" size="sm">
                          <Facebook className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm">
                          <Twitter className="h-4 w-4 mr-2" />
                          Tweet
                        </Button>
                        <Button variant="outline" size="sm">
                          <Linkedin className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      {/* Article Content */}
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </div>
                  </motion.div>
                </article>
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
