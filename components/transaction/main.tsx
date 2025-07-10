import PricingHeader from './PricingHeader'
import PricingCards from './PricingCards'
import PricingFooter from './PricingFooter'

const TransactionMain = () => {
    return (
        <div className=" py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <PricingHeader />
                <PricingCards />
                <PricingFooter />
            </div>
        </div>
    )
}

export default TransactionMain;