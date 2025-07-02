import PricingCard from './PricingCard'
import { Plan } from './types'

const PricingCards = () => {
    const plans: Plan[] = [
        {
            id: 'basic',
            name: 'Semester',
            price: 65.00,
            period: 'semester (4 months)',
            description: 'Lock in the semester deal and save some cash. Everything Nuclear offers, ready for you all semester long.',
            features: [
                'Unlimited blocks',
                'Basic templates',
                'Email support',
                '1GB storage'
            ],
            popular: false,
            color: 'blue'
        },
        {
            id: 'pro',
            name: 'Monthly',
            price: 19.00,
            period: 'month',
            description: 'All the Nuclear goodness, month to month. Perfect if you wanna keep it flexible and study at your own pace.',
            features: [
                'Everything in Basic',
                'Advanced templates',
                'Priority support',
                '10GB storage',
                'Custom branding',
                'Analytics dashboard'
            ],
            popular: true,
            color: 'purple'
        },
        {
            id: 'enterprise',
            name: 'Yearly',
            price: 120.00,
            period: 'year',
            description: 'The ultimate study buddy for the whole year. One payment, all the features, zero stress.',
            features: [
                'Everything in Pro',
                'Team collaboration',
                'Advanced analytics',
                'Unlimited storage',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee'
            ],
            popular: false,
            color: 'green'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 px-60">
            {plans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
            ))}
        </div>
    )
}

export default PricingCards 