import { TestVideo } from '../test-video'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Video Player',
  description: 'Testing Cloudflare Stream integration'
}

export default function TestPage() {
  return <TestVideo />
}