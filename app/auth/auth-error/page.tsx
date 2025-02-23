'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="container max-w-lg mx-auto px-4 py-8 md:py-16">
      <Card className="border-2 border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            There was a problem authenticating your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could happen for several reasons:
          </p>
          <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-2">
            <li>The authentication link has expired</li>
            <li>The link has already been used</li>
            <li>There was a technical problem during the authentication process</li>
          </ul>
          <Button asChild className="w-full mt-4">
            <Link href="/auth">
              Try Again
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
