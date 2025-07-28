import QuizParent from "@/components/quizComponent/parent";

export default async function QuizzesPage({ params }: { params: Promise<{ id: string }> }) {
    return <QuizParent params={params} />;
}