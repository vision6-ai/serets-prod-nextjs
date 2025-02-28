import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShortsFeed from '../shorts-feed'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}))

// Mock VideoPlayer component
jest.mock('../video-player', () => {
  return function MockVideoPlayer({ trailer, isActive }) {
    return (
      <div data-testid={`video-${trailer.cloudflare_id}`}>
        Video Player {trailer.cloudflare_id} {isActive ? '(active)' : '(inactive)'}
      </div>
    )
  }
})

const mockVideos = [
  {
    id: '1',
    cloudflare_id: 'video1',
    title: 'Video 1',
    language: 'en',
    movies: [{
      id: 'movie1',
      title: 'Movie 1',
      hebrew_title: 'סרט 1',
      poster_url: 'poster1.jpg',
      slug: 'movie-1'
    }]
  },
  {
    id: '2',
    cloudflare_id: 'video2',
    title: 'Video 2',
    language: 'en',
    movies: [{
      id: 'movie2',
      title: 'Movie 2',
      hebrew_title: 'סרט 2',
      poster_url: 'poster2.jpg',
      slug: 'movie-2'
    }]
  },
  {
    id: '3',
    cloudflare_id: 'video3',
    title: 'Video 3',
    language: 'en',
    movies: [{
      id: 'movie3',
      title: 'Movie 3',
      hebrew_title: 'סרט 3',
      poster_url: 'poster3.jpg',
      slug: 'movie-3'
    }]
  }
]

describe('ShortsFeed', () => {
  beforeEach(() => {
    // Reset window dimensions
    window.innerHeight = 844 // iPhone dimensions
    window.innerWidth = 390
  })

  it('renders all videos with first video active', () => {
    render(<ShortsFeed videos={mockVideos} />)
    
    const video1 = screen.getByTestId('video-video1')
    expect(video1).toHaveTextContent('(active)')
    
    const video2 = screen.getByTestId('video-video2')
    expect(video2).toHaveTextContent('(inactive)')
  })

  it('handles swipe up gesture correctly', async () => {
    render(<ShortsFeed videos={mockVideos} />)

    const container = screen.getByTestId('shorts-feed')

    // Simulate swipe up
    await act(async () => {
      fireEvent.touchStart(container, {
        touches: [{ clientY: 500 }]
      })
      
      fireEvent.touchMove(container, {
        touches: [{ clientY: 200 }]
      })
      
      fireEvent.touchEnd(container)
    })

    // Check if second video is now active
    const video2 = screen.getByTestId('video-video2')
    expect(video2).toHaveTextContent('(active)')
  })

  it('handles swipe down gesture correctly', async () => {
    render(<ShortsFeed videos={mockVideos} initialVideoId="video2" />)

    const container = screen.getByTestId('shorts-feed')

    // Simulate swipe down
    await act(async () => {
      fireEvent.touchStart(container, {
        touches: [{ clientY: 200 }]
      })
      
      fireEvent.touchMove(container, {
        touches: [{ clientY: 500 }]
      })
      
      fireEvent.touchEnd(container)
    })

    // Check if first video is now active
    const video1 = screen.getByTestId('video-video1')
    expect(video1).toHaveTextContent('(active)')
  })

  it('prevents invalid swipes at boundaries', async () => {
    render(<ShortsFeed videos={mockVideos} />)

    const container = screen.getByTestId('shorts-feed')

    // Try to swipe up at last video
    await act(async () => {
      // First swipe to last video
      fireEvent.touchStart(container, { touches: [{ clientY: 500 }] })
      fireEvent.touchMove(container, { touches: [{ clientY: 200 }] })
      fireEvent.touchEnd(container)
      
      fireEvent.touchStart(container, { touches: [{ clientY: 500 }] })
      fireEvent.touchMove(container, { touches: [{ clientY: 200 }] })
      fireEvent.touchEnd(container)
    })

    const lastVideo = screen.getByTestId('video-video3')
    expect(lastVideo).toHaveTextContent('(active)')

    // Try to swipe up again (should not change)
    await act(async () => {
      fireEvent.touchStart(container, { touches: [{ clientY: 500 }] })
      fireEvent.touchMove(container, { touches: [{ clientY: 200 }] })
      fireEvent.touchEnd(container)
    })

    expect(lastVideo).toHaveTextContent('(active)')
  })

  it('handles keyboard navigation', async () => {
    render(<ShortsFeed videos={mockVideos} />)

    // Press arrow down
    await act(async () => {
      fireEvent.keyDown(document, { key: 'ArrowDown' })
    })

    const video2 = screen.getByTestId('video-video2')
    expect(video2).toHaveTextContent('(active)')

    // Press arrow up
    await act(async () => {
      fireEvent.keyDown(document, { key: 'ArrowUp' })
    })

    const video1 = screen.getByTestId('video-video1')
    expect(video1).toHaveTextContent('(active)')
  })
})
