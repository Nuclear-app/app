export interface Plan {
    id: string
    name: string
    price: number
    period: string
    description: string
    features: string[]
    popular: boolean
    color: string
}

export interface PricingCardProps {
    plan: Plan
} 