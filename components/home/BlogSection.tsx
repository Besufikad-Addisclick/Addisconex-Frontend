"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define the interface for post data
interface Post {
  id: string | number;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  category: string;
}

// Define the props interface for BlogSection
interface BlogSectionProps {
  latest_news?: Array<{
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



export default function BlogSection({ latest_news }: BlogSectionProps) {
  // Only use latest_news, no dummy data
  const posts: Post[] = latest_news
    ? latest_news.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.content
          .replace(/<[^>]+>/g, '') // Strip HTML tags
          .split(' ')
          .slice(0, 20)
          .join(' ')
          .concat('...'), // Create excerpt
        image: article.image,
        author: `${article.author.first_name} ${article.author.last_name}`,
        date: article.date,
        category: article.category
      }))
    : [];

  if (!posts.length) return null;
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Industry Insights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest trends, analysis, and insights in the construction industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    <span>{post.author}</span>
                    <Calendar className="h-4 w-4 ml-4 mr-2" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild>
            <Link href="/blog" className="inline-flex items-center">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
