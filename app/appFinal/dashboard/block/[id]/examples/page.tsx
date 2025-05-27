import Examples from "@/components/examples"

export default async function ExamplesPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <Examples blockID={params.id} />
        </div>);
}