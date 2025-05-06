'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { BlogPostForm } from '../_components/blog-post-form'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  status: 'published' | 'draft' | 'archived'
  author_name: string
  author_bio: string | null
  author_avatar_url: string | null
  published_at: string | null
  movie_id: string | null
  rating: number | null
  meta_title: string | null
  meta_description: string | null
  pros: string[] | null
  cons: string[] | null
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const postId = params.id

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', postId)
          .single()
        
        if (error) {
          throw error
        }
        
        setPost(data)
      } catch (err: any) {
        console.error('Error fetching blog post:', err)
        setError(err.message || 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, supabase])

  const handleSave = async (updatedPost: Partial<BlogPost>) => {
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(updatedPost)
        .eq('id', postId)
      
      if (error) {
        throw error
      }
      
      router.push('/dashboard/blog-posts')
    } catch (err: any) {
      console.error('Error updating blog post:', err)
      setError(err.message || 'Failed to update blog post')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">Loading blog post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg">
        <h1 className="text-xl font-bold text-red-800 mb-4">Error</h1>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex space-x-4">
          <Link 
            href="/dashboard/blog-posts"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog Posts
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h1 className="text-xl font-bold text-yellow-800 mb-4">Blog Post Not Found</h1>
        <p className="text-yellow-700 mb-4">
          The blog post you're trying to edit doesn't exist or has been deleted.
        </p>
        <Link 
          href="/dashboard/blog-posts"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center inline-flex"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog Posts
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/blog-posts"
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
      </div>

      <BlogPostForm 
        initialData={post} 
        onSave={handleSave} 
        isLoading={loading}
      />
    </div>
  )
} 