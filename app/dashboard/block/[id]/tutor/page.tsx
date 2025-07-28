import TutorMain from "@/components/tutor/main";

export default async function TutorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return (
        <TutorMain blockId={id} />
    )
}