import Link from "next/link";

export default async function NoteTakingPage() {
    return (
        <div>
            <h1>Note Taking</h1>
            <Link href="../mode-specific/fileUpload">
                <button>Upload</button>
            </Link>
        </div>
    );
}