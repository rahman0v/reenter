import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Define type for blog posts
type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string;
  featured?: boolean;
  readTime: string;
};

// Sample blog data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Understanding the New Turkish Rental Law Amendments",
    excerpt: "Recent changes to Turkish rental laws have significant implications for both landlords and tenants. Learn how these updates affect your rights and responsibilities.",
    category: "Industry News",
    date: "June 15, 2023",
    author: "Ahmet Yılmaz",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80",
    featured: true,
    readTime: "8 min read"
  },
  {
    id: 2,
    title: "10 Essential Tips for First-Time Landlords",
    excerpt: "Starting your journey as a landlord? These crucial tips will help you avoid common pitfalls and establish a profitable rental business from day one.",
    category: "Educational Guides",
    date: "May 28, 2023",
    author: "Zeynep Kaya",
    imageUrl: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80",
    readTime: "6 min read"
  },
  {
    id: 3,
    title: "Introducing Digital Lease Agreements: A Paperless Future",
    excerpt: "Reenter's new digital lease agreement feature streamlines the rental process. Say goodbye to printing, scanning, and physical signatures.",
    category: "Product Updates",
    date: "May 15, 2023",
    author: "Emre Demir",
    imageUrl: "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80",
    readTime: "4 min read"
  },
  {
    id: 4,
    title: "Navigating Tenant Insurance: What's Required and What's Recommended",
    excerpt: "Understanding insurance requirements for rentals can be complicated. This guide breaks down what's legally required versus what's smart to have.",
    category: "Insurance & Risk Management",
    date: "April 30, 2023",
    author: "Selin Arslan",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2946&q=80",
    readTime: "7 min read"
  },
  {
    id: 5,
    title: "How to Conduct a Thorough Property Inspection: A Step-by-Step Guide",
    excerpt: "Learn how to properly inspect a property before and after tenancy to protect your investment and avoid disputes over damage claims.",
    category: "How-to Tutorials",
    date: "April 18, 2023",
    author: "Can Özdemir",
    imageUrl: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2273&q=80",
    readTime: "9 min read"
  },
  {
    id: 6,
    title: "From Start-Up to Scale-Up: The Reenter Journey",
    excerpt: "Our founder shares the challenges and triumphs of building Reenter from a simple idea to a transformative force in Turkey's rental market.",
    category: "Company Stories",
    date: "March 25, 2023",
    author: "Mert Yılmaz",
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2784&q=80",
    readTime: "5 min read"
  },
  {
    id: 7,
    title: "The Complete Guide to Tenant Screening in Turkey",
    excerpt: "Effective tenant screening is crucial for successful property management. Learn legal and practical approaches to finding reliable tenants.",
    category: "Educational Guides",
    date: "March 12, 2023",
    author: "Ayşe Kartal",
    imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2671&q=80",
    readTime: "8 min read"
  },
  {
    id: 8,
    title: "Understanding Deposit Protection Regulations in Turkish Rental Law",
    excerpt: "Security deposits are a frequent source of disputes. Learn how recent legal updates affect how deposits must be handled and documented.",
    category: "Industry News",
    date: "February 28, 2023",
    author: "Ahmet Yılmaz",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80",
    readTime: "6 min read"
  }
];

// All available categories
const categories = [
  "All",
  "Educational Guides",
  "Industry News",
  "Product Updates",
  "Insurance & Risk Management",
  "How-to Tutorials",
  "Company Stories"
];

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");

  // Get featured article
  const featuredArticle = blogPosts.find(post => post.featured);
  
  // Filter blog posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle newsletter signup
  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the email to a backend service
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  return (
    <div className="bg-white pb-24 pt-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mx-auto max-w-3xl text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Insights & Updates from Reenter
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Discover the latest trends, tips, and news in the property rental industry
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="mx-auto max-w-3xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="search"
              id="search"
              className="block w-full p-4 pl-10 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            className="mx-auto max-w-6xl mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative overflow-hidden rounded-xl">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${featuredArticle.imageUrl})`,
                  filter: 'brightness(0.5)'
                }}
              ></div>
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="max-w-3xl">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-primary-600 rounded-full mb-4">
                    Featured
                  </span>
                  <span className="ml-2 inline-block px-3 py-1 text-xs font-medium text-white bg-gray-700 bg-opacity-70 rounded-full">
                    {featuredArticle.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-200 text-lg mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">{featuredArticle.author}</p>
                      <p className="text-sm">{featuredArticle.date} · {featuredArticle.readTime}</p>
                    </div>
                  </div>
                  <button className="mt-6 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors">
                    Read Full Article
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Categories Section */}
        <motion.div
          className="mx-auto max-w-6xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Articles</h2>
            <p className="text-gray-600">{filteredPosts.length} articles</p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
              <p className="mt-2 text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * post.id }}
                >
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${post.imageUrl})` }}
                  ></div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Read more →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          className="mx-auto max-w-4xl mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-primary-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated</h2>
              <p className="text-gray-600">
                Subscribe to our newsletter to receive the latest insights, tips, and updates on rental property management.
              </p>
            </div>
            <form onSubmit={handleNewsletterSignup} className="max-w-lg mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  id="email"
                  className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg flex-grow focus:ring-primary-500 focus:border-primary-500 block p-3"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-6 py-3"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 