import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUserSubscriptionStatus, isTrialExpired } from '@/lib/user'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    // Verify the user is checking their own subscription
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check subscription status
    const subscriptionStatus = await getUserSubscriptionStatus(userId)
    
    // Allow access if user is PAID
    if (subscriptionStatus === 'PAID') {
      return NextResponse.json({ hasValidSubscription: true })
    }
    
    // Check if trial has expired
    const trialExpired = await isTrialExpired(userId)
    
    return NextResponse.json({ 
      hasValidSubscription: !trialExpired,
      subscriptionStatus,
      trialExpired
    })

  } catch (error) {
    console.error('Error checking subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 