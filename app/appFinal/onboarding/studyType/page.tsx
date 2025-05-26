import Link from "next/link";

export default async function StudyTypePage() {
    return (
        <div>
            <h1>Onboarding</h1>
            <Link href="../mode-specific/notetaking">Hard</Link>
            <Link href="../mode-specific/fileUpload">Medium</Link>
            <Link href="../mode-specific/fileUpload">Easy</Link>
        </div>
    );
}