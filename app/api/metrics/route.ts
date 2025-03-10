import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log metrics in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Performance metric:', body)
      return NextResponse.json({ success: true })
    }
    
    // In production, you would send these metrics to your analytics service
    // Example: Send to a database, logging service, or analytics platform
    
    // For now, we'll just log them
    console.log('Performance metric:', {
      name: body.name,
      value: body.value,
      id: body.id,
      page: body.page,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    )
  }
}