import { FillInTheBlanksContent } from "@/components/FITB/fill-in-blank";
import { Suspense } from "react";

export default function FillInTheBlanks() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FillInTheBlanksContent />
        </Suspense>
    );
} 