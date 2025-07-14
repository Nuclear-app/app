import ExamplesParent from "@/components/exampleComponent/parent";

export default function ExamplesPage({ params }: { params: Promise<{ id: string }> }) {
    return <ExamplesParent params={params} />;
}