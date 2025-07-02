const PricingHeader = () => {
    return (
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
                Hello again! Sorry to bother
            </h1>
            <p className="text-md mb-6 max-w-2xl mx-auto">
                We hope these 2 weeks have been fun. We've been working hard to make sure you have the best experience possible. Now's the time for the big question though. Will you stay with us?
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No commitment • Cancel anytime
            </div>
        </div>
    )
}

export default PricingHeader 