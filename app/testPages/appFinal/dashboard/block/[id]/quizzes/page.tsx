import { Quiz } from "@/components/quiz";

type Params = Promise<{ slug: string[] }>

export default async function QuizzesPage({ params }: { params: Params }) {
    const { slug } = await params
    const id = slug[0]
    return (
        <div>
            <Quiz blockId={id} />
        </div>
    );
}