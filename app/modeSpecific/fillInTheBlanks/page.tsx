import { Suspense } from "react";
import { FillInTheBlanksContent } from "@/components/FITB/fillInTheBlanksContent";

export default function FillInTheBlanks() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FillInTheBlanksContent />
        </Suspense>
    );
} 