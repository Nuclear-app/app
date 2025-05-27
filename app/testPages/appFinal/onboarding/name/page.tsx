import Link from "next/link";

export default async function NamePage() {
    return (
        <div>
            <h1>Onboarding</h1>
            <Link href="../onboarding/studyType">Name</Link>
        </div>
    );
}