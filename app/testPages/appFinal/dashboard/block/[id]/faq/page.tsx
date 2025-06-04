import FAQ from "@/components/faq";

type Params = Promise<{ slug: string[] }>

export default async function FAQPage({ params }: { params: Params }) {
    const { slug } = await params
    const id = slug[0]
    const context = 'This is a test context';
    return (
        <div>
            <FAQ blockId={id} text={context} />
        </div>
    );
}