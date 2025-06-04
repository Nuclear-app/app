import Examples from "@/components/examples"

type Params = Promise<{ slug: string[] }>

export default async function ExamplesPage({ params }: { params: Params }) {
    const { slug } = await params
    const id = slug[0]
    return (
        <div>
            <Examples blockID={id} />
        </div>
    );
}
