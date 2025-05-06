'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  LayoutDashboard, 
  FileText, 
  Film, 
  Tag, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/dashboard/login')
        return
      }
      
      const userEmail = session.user?.email
      
      // Only allow specific email
      if (userEmail !== 'yinon@vision6.ai') {
        await supabase.auth.signOut()
        router.push('/dashboard/login')
        return
      }
      
      setEmail(userEmail)
      setIsLoading(false)
    }
    
    checkUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/dashboard/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Blog Posts', href: '/dashboard/blog-posts', icon: <FileText className="w-5 h-5" /> },
    { label: 'Movies', href: '/dashboard/movies', icon: <Film className="w-5 h-5" /> },
    { label: 'Categories & Tags', href: '/dashboard/categories', icon: <Tag className="w-5 h-5" /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  ]

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-gray-800">Movie Admin</h1>
          </div>
          
          <div className="flex flex-col flex-grow p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 space-x-3 rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            ))}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">{email?.[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {email}
                </p>
                <p className="text-sm text-gray-500 truncate">Administrator</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full p-3 space-x-3 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 ml-0 md:ml-64 p-4 md:p-8 overflow-auto transition-all duration-300`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 