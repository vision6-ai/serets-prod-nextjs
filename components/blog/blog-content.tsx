'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { motion, useScroll } from 'framer-motion'
import { BlogPost } from '@/lib/blog'
import { Separator } from '@/components/ui/separator'

export interface BlogContentProps {
  content: string;
  rating: number | null;
  pros?: string[];
  cons?: string[];
}

export function BlogContent({ content, rating, pros = [], cons = [] }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ 
    target: contentRef,
    offset: ["start start", "end end"]
  })
  
  // Convert newlines to paragraphs in the content
  const formattedContent = content
    .split('\n')
    .filter(para => para.trim() !== '')
    .map((para, index) => (
      <motion.p 
        key={index} 
        className="mb-6 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      >
        {para}
      </motion.p>
    ))
  
  return (
    <article className="max-w-4xl mx-auto pb-12">
      {/* Reading progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Main content */}
      <div 
        ref={contentRef}
        className="prose prose-lg dark:prose-invert max-w-none"
      >
        {formattedContent}
        
        {/* Pros and Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <motion.div
            className="bg-muted p-6 rounded-lg my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Review Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pros.length > 0 && (
                <div>
                  <h4 className="font-bold text-green-500 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Pros
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {cons.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-500 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cons
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {rating && (
              <div className="mt-6 flex items-center">
                <p className="mr-2 font-bold">Final Rating:</p>
                <div className="px-3 py-1 rounded-lg bg-yellow-500/80 text-black font-bold">
                  {rating}/10
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Social sharing */}
      <motion.div
        className="mt-10 flex justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <button 
          className="p-3 rounded-full bg-[#1877F2] text-white"
          onClick={() => {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
          }}
          aria-label="Share on Facebook"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
          </svg>
        </button>
        <button 
          className="p-3 rounded-full bg-[#1DA1F2] text-white"
          onClick={() => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this movie review!")}&url=${encodeURIComponent(window.location.href)}`, '_blank')
          }}
          aria-label="Share on Twitter"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.9572 14.8821 3.28445C14.0247 3.61171 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
          </svg>
        </button>
        <button 
          className="p-3 rounded-full bg-[#0A66C2] text-white"
          onClick={() => {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')
          }}
          aria-label="Share on LinkedIn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
            <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
            <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
          </svg>
        </button>
      </motion.div>
    </article>
  )
} 