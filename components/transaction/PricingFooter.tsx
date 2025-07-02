import Link from "next/link"

const PricingFooter = () => {
    return (
        <div className="text-center flex flex-col gap-4 text-xs">
            <div>
                Don't let a price tag stop you from learning. {''}
                <Link href="#" className="underline underline-offset-4">Tell us your story and we'll get back to you!</Link> 
            </div>
            <div>
                Still don't think Nuclear is for you? {''}
                <Link href="#" className="underline underline-offset-4">Tell us how we can improve!</Link> 
            </div>

        </div>
    )
}

export default PricingFooter 