import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function BlogPostLoading() {
  return (
    <main className="pt-8">
      <div className="container mx-auto">
        <Skeleton className="h-6 w-24 mb-6" />
        
        <article className="max-w-4xl mx-auto px-4 lg:px-0 pb-12">
          <header className="mb-10">
            {/* Genre badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            
            {/* Title */}
            <Skeleton className="h-12 w-3/4 mb-6" />
            
            {/* Author and metadata */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="ml-auto">
                <Skeleton className="h-10 w-20 rounded-lg" />
              </div>
            </div>
            
            {/* Featured image */}
            <div className="aspect-video w-full mb-10 overflow-hidden rounded-xl">
              <Skeleton className="h-full w-full" />
            </div>
            
            <Separator className="mb-10" />
          </header>
          
          {/* Main content */}
          <div className="prose prose-lg max-w-none">
            {/* Movie info box */}
            <div className="bg-muted p-6 rounded-lg mb-8">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-40" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
            
            {/* Content paragraphs */}
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-5 w-11/12 mb-6" />
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-5 w-3/4 mb-6" />
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-5 w-10/12 mb-6" />
            <Skeleton className="h-5 w-full mb-6" />
            <Skeleton className="h-5 w-full mb-10" />
            
            {/* Author bio */}
            <div className="mt-12 p-6 bg-card rounded-xl border">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            
            {/* Social sharing */}
            <div className="mt-10 flex justify-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </article>
        
        {/* Related posts */}
        <section className="py-12 border-t">
          <Skeleton className="h-10 w-48 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="h-full">
                <div className="overflow-hidden h-full rounded-lg border">
                  {/* Card image skeleton */}
                  <div className="relative aspect-[16/9] w-full">
                    <Skeleton className="h-full w-full" />
                  </div>
                  
                  {/* Card content skeleton */}
                  <div className="p-4">
                    <Skeleton className="h-6 w-5/6 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
} 