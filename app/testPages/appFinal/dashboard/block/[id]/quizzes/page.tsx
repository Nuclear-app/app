import { Quiz } from "@/components/quiz";

export default function QuizzesPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <Quiz blockId={params.id} />
        </div>
    );
}