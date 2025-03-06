// This is a server component
import { Suspense } from 'react'
import AuthClient from './auth-client'

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthClient />
    </Suspense>
  )
}

function AuthLoading() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-16 flex justify-center items-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
        <div className="h-6 w-48 bg-primary/20 rounded mb-2"></div>
        <div className="h-4 w-32 bg-primary/20 rounded"></div>
      </div>
    </div>
  )
} 