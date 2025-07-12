"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loading } from '@/components/ui/loading'

interface SubscriptionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasValidSubscription, setHasValidSubscription] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setIsLoading(false)
          return
        }

        // Use the API endpoint instead of calling Prisma functions directly
        const response = await fetch('/api/auth/check-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        })

        if (response.ok) {
          const { hasValidSubscription } = await response.json()
          setHasValidSubscription(hasValidSubscription)
          
          if (!hasValidSubscription) {
            router.push('/transaction')
            return
          }
        } else {
          // If the API fails, allow access (fail open)
          setHasValidSubscription(true)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        // If there's an error, allow access (fail open)
        setHasValidSubscription(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkSubscription()
  }, [router])

  if (isLoading) {
    return fallback || <Loading />
  }

  if (!hasValidSubscription) {
    return null // Will redirect to transaction page
  }

  return <>{children}</>
} 