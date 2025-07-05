import TutorMain from "@/components/tutor/main";

export default function TutorPage({ params }: { params: { id: string } }) {
    const { id } = params
    return (
        <TutorMain blockId={id} />
    )
}