import FAQ from "@/components/faq";

export default async function FAQPage({ params }: { params: { id: string } }) {
    const context = 'This is a test context';
    return (
        <div>
            <FAQ blockId={params.id} text={context} />
        </div>
    );
}