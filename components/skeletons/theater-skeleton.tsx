import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * Skeleton loader for theater page
 */
export function TheaterSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Theater Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Promotional Banner */}
      <div className="mb-8">
        <Skeleton className="w-full h-48 md:h-64 rounded-lg" />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="movies" className="space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="movies" className="flex-1 md:flex-none">Now Showing</TabsTrigger>
          <TabsTrigger value="info" className="flex-1 md:flex-none">Theater Info</TabsTrigger>
          <TabsTrigger value="past" className="flex-1 md:flex-none">Past Screenings</TabsTrigger>
        </TabsList>

        {/* Now Showing Tab */}
        <TabsContent value="movies" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <Skeleton className="h-10 w-full md:w-40" />
            <Skeleton className="h-10 w-full md:w-40" />
            <Skeleton className="h-10 w-full md:w-40" />
          </div>

          {/* Movies Grid - 4 columns on desktop, 2 on tablet, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                {/* Movie poster skeleton - 70% height */}
                <Skeleton className="w-full pt-[70%] relative" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Skeleton loader for theater list
 */
export function TheaterListSkeleton() {
  return (
    <div>
      <Skeleton className="h-10 w-48 mb-8" />
      
      <Skeleton className="h-10 w-full mb-8" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
