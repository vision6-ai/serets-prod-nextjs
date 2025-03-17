'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { mockTrailers, addTestTrailers } from './test-data'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [dbVideos, setDbVideos] = useState<any[]>([])
  const [envStatus, setEnvStatus] = useState<{
    supabaseUrl: boolean;
    supabaseKey: boolean;
    cloudflareKey: boolean;
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    cloudflareKey: false,
  })

  useEffect(() => {
    // Check environment variables
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      cloudflareKey: !!process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_SIGNING_KEY,
    })
    
    // Check for videos in the database
    checkExistingVideos();
  }, [])
  
  const checkExistingVideos = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or key not found in environment variables')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('type', 'trailer')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching videos:', error)
      } else {
        console.log('Found videos in database:', videos)
        setDbVideos(videos || [])
      }
    } catch (error) {
      console.error('Error checking videos:', error)
    }
  }

  const handleAddTestData = async () => {
    setStatus('loading')
    setMessage('Adding test data to Supabase...')
    
    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or key not found in environment variables')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Add test data
      const result = await addTestTrailers(supabase)
      setStatus('success')
      setMessage(`Test data added successfully! Added ${result?.length || 0} videos.`)
      console.log('Test data result:', result)
      
      // Refresh the list of videos
      await checkExistingVideos()
    } catch (error) {
      console.error('Error adding test data:', error)
      setStatus('error')
      setMessage(`Error adding test data: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleCleanupOldData = async () => {
    setStatus('loading')
    setMessage('Cleaning up old test data...')
    
    try {
      // Create Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or key not found in environment variables')
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Remove old test video with ID "09df3dd1f83a66cb3089605f111c8bb4"
      const { error: videoError } = await supabase
        .from('videos')
        .delete()
        .eq('cloudflare_id', '09df3dd1f83a66cb3089605f111c8bb4')
      
      if (videoError) {
        throw new Error(`Error removing old video: ${videoError.message}`)
      }
      
      setStatus('success')
      setMessage('Old test data cleaned up successfully!')
      
      // Refresh the list of videos
      await checkExistingVideos()
    } catch (error) {
      console.error('Error cleaning up test data:', error)
      setStatus('error')
      setMessage(`Error cleaning up data: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  const handleDirectNavigateToVideo = (videoId: string) => {
    window.location.href = `/shorts/${videoId}`
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Shorts Feature Test Page</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className={`inline-block w-6 h-6 rounded-full mr-2 ${envStatus.supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
            NEXT_PUBLIC_SUPABASE_URL: {envStatus.supabaseUrl ? 'Set ✓' : 'Missing ✗'}
          </li>
          <li className="flex items-center">
            <span className={`inline-block w-6 h-6 rounded-full mr-2 ${envStatus.supabaseKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
            NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.supabaseKey ? 'Set ✓' : 'Missing ✗'}
          </li>
          <li className="flex items-center">
            <span className={`inline-block w-6 h-6 rounded-full mr-2 ${envStatus.cloudflareKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
            NEXT_PUBLIC_CLOUDFLARE_STREAM_SIGNING_KEY: {envStatus.cloudflareKey ? 'Set ✓' : 'Missing ✗'}
          </li>
        </ul>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Information</h2>
        <p className="mb-3">
          This page will create two sample trailers and movies in your Supabase database, 
          using your existing Cloudflare video:
        </p>
        
        <div className="mb-4 space-y-4">
          <div className="bg-black/10 dark:bg-white/10 p-3 rounded">
            <h3 className="font-bold">Video 1:</h3>
            <p>ID: {mockTrailers[0].id}</p>
            <p>Title: {mockTrailers[0].title}</p>
            <p>Cloudflare ID: {mockTrailers[0].cloudflare_id}</p>
            <p>Language: {mockTrailers[0].language}</p>
          </div>
          
          <div className="bg-black/10 dark:bg-white/10 p-3 rounded">
            <h3 className="font-bold">Video 2:</h3>
            <p>ID: {mockTrailers[1].id}</p>
            <p>Title: {mockTrailers[1].title}</p>
            <p>Cloudflare ID: {mockTrailers[1].cloudflare_id}</p>
            <p>Language: {mockTrailers[1].language}</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong>Note:</strong> Make sure this video exists in your Cloudflare Stream account and that your 
          Cloudflare Stream Signing Key is properly set in your <code>.env</code> file.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm">
          <p className="font-medium">Video URL Format:</p>
          <code className="block mt-1 font-mono">
            https://videodelivery.net/{mockTrailers[0].cloudflare_id}/manifest/video.m3u8
          </code>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        
        <div className="space-y-4">
          <div>
            <Button
              onClick={handleCleanupOldData}
              disabled={status === 'loading'}
              variant="outline"
              className="w-full mb-2"
            >
              {status === 'loading' && message.includes('Cleaning') ? 'Cleaning...' : 'Cleanup Old Test Data'}
            </Button>
            <p className="text-sm text-gray-500">This will remove any old test videos with outdated video IDs.</p>
          </div>
          
          <div>
            <Button
              onClick={handleAddTestData}
              disabled={status === 'loading'}
              className="w-full mb-2"
            >
              {status === 'loading' && message.includes('Adding') ? 'Adding...' : 'Add Test Data to Database'}
            </Button>
            <p className="text-sm text-gray-500">This will add two test trailers with your Cloudflare video ID.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              onClick={() => handleDirectNavigateToVideo(mockTrailers[0].cloudflare_id)}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={status === 'loading'}
            >
              Video 1 Direct Link
            </Button>
            
            <Button
              onClick={() => handleDirectNavigateToVideo(mockTrailers[1].cloudflare_id)}
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              disabled={status === 'loading'}
            >
              Video 2 Direct Link
            </Button>
          </div>
          
          <div>
            <Link href="/shorts">
              <Button variant="secondary" className="w-full mb-2">
                Go to Shorts Page
              </Button>
            </Link>
            <p className="text-sm text-gray-500">Navigate to the main shorts page.</p>
          </div>
        </div>
      </div>

      {(status === 'success' || status === 'error') && (
        <div className={`p-4 rounded-md mb-6 ${
          status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          <p className="font-medium">{message}</p>
        </div>
      )}
      
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Videos in Database ({dbVideos.length})</h2>
        
        {dbVideos.length === 0 ? (
          <p className="text-gray-500">No videos found in database.</p>
        ) : (
          <div className="space-y-3">
            {dbVideos.map((video) => (
              <div key={video.id} className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{video.title}</h3>
                    <p className="text-sm text-gray-500">ID: {video.id}</p>
                    <p className="text-sm">Cloudflare ID: {video.cloudflare_id}</p>
                    <p className="text-sm">Language: {video.language}</p>
                    <p className="text-sm">Status: {video.cloudflare_status}</p>
                    <p className="text-sm">Movie ID: {video.movie_id}</p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleDirectNavigateToVideo(video.cloudflare_id)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debugging Instructions</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>If videos don't appear, check your browser console for errors</li>
          <li>Verify that all environment variables are properly set</li>
          <li>Confirm that the Cloudflare video ID exists in your Cloudflare Stream account</li>
          <li>Try cleaning up old data before adding new test data</li>
          <li>If issues persist, check the network tab for failed requests</li>
        </ul>
      </div>
    </div>
  )
}