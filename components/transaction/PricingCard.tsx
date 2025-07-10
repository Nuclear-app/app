'use client'

import { useState } from 'react'
import { Plan, PricingCardProps } from './types'

const PricingCard = ({ plan }: PricingCardProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubscribe = async () => {
        setIsLoading(true)
        
        // Payment links for each plan
        const paymentLinks = {
            'basic': 'https://buy.stripe.com/5kQ9ASfMvb6SfzV80b28800',
            'pro': 'https://buy.stripe.com/28EfZgfMv0se0F13JV28802', 
            'enterprise': 'https://buy.stripe.com/aFa7sK2ZJ5MycnJbcn28801'
        }
        
        const paymentLink = paymentLinks[plan.id as keyof typeof paymentLinks]
        
        if (paymentLink) {
            // Redirect to payment page
            window.open(paymentLink, '_blank')
        }
        
        // TODO: Add any additional logic like updating user status in database
        console.log(`Subscribing to ${plan.name} plan`)
        
        setTimeout(() => setIsLoading(false), 2000)
    }

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'border-blue-200 bg-blue-50'
            case 'purple':
                return 'border-purple-200 bg-purple-50'
            case 'green':
                return 'border-green-200 bg-green-50'
            default:
                return 'border-gray-200 bg-gray-50'
        }
    }

    const getButtonClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            case 'purple':
                return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
            case 'green':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            default:
                return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
        }
    }

    return (
        <div className={`relative rounded-lg border-2 p-4 ${plan.popular ? 'border-purple-500 shadow-md scale-105' : 'border-gray-200'} ${getColorClasses(plan.color)}`}>
            {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                        Fan favourite
                    </span>
                </div>
            )}
            
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{plan.description}</p>
                
                <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 text-xs">/{plan.period}</span>
                </div>
            </div>

            <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full py-2 px-3 rounded-md text-white font-semibold text-xs transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonClasses(plan.color)} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </div>
                ) : (
                    `Subscribe to ${plan.name}`
                )}
            </button>
        </div>
    )
}

export default PricingCard 