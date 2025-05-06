'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { 
  FileText, 
  Film, 
  Users, 
  Calendar, 
  Eye, 
  Star, 
  BarChart2, 
  Plus,
  ChevronRight
} from 'lucide-react'

interface DashboardStats {
  totalBlogPosts: number
  publishedBlogPosts: number
  draftBlogPosts: number
  totalMovies: number
  totalReviews: number
  lastUpdated: string | null
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    draftBlogPosts: 0,
    totalMovies: 0,
    totalReviews: 0,
    lastUpdated: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get blog stats
        const { data: blogPosts, error: blogError } = await supabase
          .from('blog_posts')
          .select('id, status')
        
        if (blogError) throw blogError

        // Get movie count
        const { count: movieCount, error: movieError } = await supabase
          .from('movies')
          .select('id', { count: 'exact', head: true })
        
        if (movieError) throw movieError

        // Get review count
        const { count: reviewCount, error: reviewError } = await supabase
          .from('reviews')
          .select('id', { count: 'exact', head: true })
        
        if (reviewError) throw reviewError

        // Get last updated timestamp
        const { data: latestBlog, error: latestBlogError } = await supabase
          .from('blog_posts')
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
        
        if (latestBlogError) throw latestBlogError

        const { data: latestMovie, error: latestMovieError } = await supabase
          .from('movies')
          .select('updated_at')
          .order('updated_at', { ascending: false })
          .limit(1)
        
        if (latestMovieError) throw latestMovieError

        // Calculate stats
        const publishedPosts = blogPosts?.filter(post => post.status === 'published').length || 0
        const draftPosts = blogPosts?.filter(post => post.status === 'draft').length || 0
        
        // Get latest update time between blog and movie
        const latestBlogTime = latestBlog?.[0]?.updated_at
        const latestMovieTime = latestMovie?.[0]?.updated_at
        let lastUpdated = null
        
        if (latestBlogTime && latestMovieTime) {
          lastUpdated = new Date(Math.max(
            new Date(latestBlogTime).getTime(),
            new Date(latestMovieTime).getTime()
          )).toISOString()
        } else if (latestBlogTime) {
          lastUpdated = latestBlogTime
        } else if (latestMovieTime) {
          lastUpdated = latestMovieTime
        }

        setStats({
          totalBlogPosts: blogPosts?.length || 0,
          publishedBlogPosts: publishedPosts,
          draftBlogPosts: draftPosts,
          totalMovies: movieCount || 0,
          totalReviews: reviewCount || 0,
          lastUpdated
        })
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const StatCard = ({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} text-white mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  )

  const QuickAction = ({ title, href, icon }: { title: string, href: string, icon: React.ReactNode }) => (
    <Link 
      href={href}
      className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-blue-50 transition-colors"
    >
      <div className="p-2 bg-blue-100 rounded-md text-blue-600 mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400" />
    </Link>
  )

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <h1 className="text-lg font-medium mb-2">Error</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(stats.lastUpdated)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Blog Posts" 
          value={stats.totalBlogPosts} 
          icon={<FileText className="h-6 w-6" />} 
          color="bg-blue-600"
        />
        <StatCard 
          title="Published Posts" 
          value={stats.publishedBlogPosts} 
          icon={<Eye className="h-6 w-6" />} 
          color="bg-green-600"
        />
        <StatCard 
          title="Draft Posts" 
          value={stats.draftBlogPosts} 
          icon={<FileText className="h-6 w-6" />} 
          color="bg-amber-600"
        />
        <StatCard 
          title="Total Movies" 
          value={stats.totalMovies} 
          icon={<Film className="h-6 w-6" />} 
          color="bg-purple-600"
        />
        <StatCard 
          title="Total Reviews" 
          value={stats.totalReviews} 
          icon={<Star className="h-6 w-6" />} 
          color="bg-pink-600"
        />
        <StatCard 
          title="Review Ratio" 
          value={`${stats.totalMovies ? Math.round((stats.totalReviews / stats.totalMovies) * 100) : 0}%`} 
          icon={<BarChart2 className="h-6 w-6" />} 
          color="bg-indigo-600"
        />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <QuickAction 
          title="Create New Blog Post" 
          href="/dashboard/blog-posts/new" 
          icon={<Plus className="h-5 w-5" />} 
        />
        <QuickAction 
          title="Add New Movie" 
          href="/dashboard/movies/new" 
          icon={<Plus className="h-5 w-5" />} 
        />
        <QuickAction 
          title="Manage Blog Posts" 
          href="/dashboard/blog-posts" 
          icon={<FileText className="h-5 w-5" />} 
        />
        <QuickAction 
          title="Manage Movies" 
          href="/dashboard/movies" 
          icon={<Film className="h-5 w-5" />} 
        />
      </div>
    </div>
  )
} 