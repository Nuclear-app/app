'use client'

import { useEffect, useState } from 'react'
import { TextAnimate } from './text-animate'

export function FunFacts() {
  const [fact, setFact] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchFact = async () => {
    try {
      const response = await fetch('/api/facts', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch fact')
      }
      
      const data = await response.json()
      if (data.text) {
        setFact(data.text)
      }
    } catch (error) {
      console.error('Error fetching fact:', error)
      setFact('Did you know? The first computer programmer was Ada Lovelace, who wrote the first algorithm in the 1840s.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFact()
    const interval = setInterval(fetchFact, 10000) // Change fact every 5 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <TextAnimate className="text-2xl">Loading fun fact...</TextAnimate>
  }

  return <TextAnimate className="text-2xl">{fact}</TextAnimate>
} 