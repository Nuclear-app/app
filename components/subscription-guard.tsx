"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { isTrialExpired, getUserSubscriptionStatus } from '@/lib/user'
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

        // Check subscription status
        const subscriptionStatus = await getUserSubscriptionStatus(user.id)
        
        // Allow access if user is PAID
        if (subscriptionStatus === 'PAID') {
          setHasValidSubscription(true)
          setIsLoading(false)
          return
        }
        
        // Check if trial has expired
        const trialExpired = await isTrialExpired(user.id)
        
        if (trialExpired) {
          router.push('/transaction')
          return
        }
        
        // Trial is still valid
        setHasValidSubscription(true)
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