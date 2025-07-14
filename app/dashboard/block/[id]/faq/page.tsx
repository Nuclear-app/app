import FAQParent from "@/components/faqComponent/parent";

export default function FAQPage({ params }: { params: Promise<{ id: string }> }) {
    return <FAQParent params={params} />;
}