'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { BlogPostForm } from '../_components/blog-post-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'

interface BlogPost {
  id?: string
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

export default function NewBlogPostPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const initialData: BlogPost = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: null,
    status: 'draft',
    author_name: 'Admin',
    author_bio: null,
    author_avatar_url: null,
    published_at: null,
    movie_id: null,
    rating: null,
    meta_title: null,
    meta_description: null,
    pros: [],
    cons: []
  }

  const handleSave = async (newPost: BlogPost) => {
    setLoading(true)
    setError(null)

    // Generate a slug if not provided
    if (!newPost.slug && newPost.title) {
      newPost.slug = slugify(newPost.title)
    }
    
    try {
      // Set the published date if status is published
      if (newPost.status === 'published' && !newPost.published_at) {
        newPost.published_at = new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(newPost)
        .select()
      
      if (error) {
        throw error
      }
      
      router.push('/dashboard/blog-posts')
    } catch (err: any) {
      console.error('Error creating blog post:', err)
      setError(err.message || 'Failed to create blog post')
      setLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
      </div>

      {error && (
        <div className="bg-red-50 p-4 mb-6 rounded-md text-red-700">
          {error}
        </div>
      )}

      <BlogPostForm 
        initialData={initialData} 
        onSave={handleSave} 
        isLoading={loading}
        isNew
      />
    </div>
  )
} 