"use client";
import FAQ from "@/components/faqComponent/faq";
import { useEffect, useState, use } from "react";
import { getFullContext } from "@/lib/context";
import { BlockViewNav } from "@/components/blockViewNav";
import { Loading } from "@/components/ui/loading";

interface Props {
    params: Promise<{ id: string }>;
}

export default function FAQParent({ params }: Props) {
    const { id } = use(params);
    const [context, setContext] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadContext = async () => {
            if (!id) {
                console.error('No block ID provided');
                setIsLoading(false);
                return;
            }

            console.log('Loading context for block:', id);
            try {
                const blockContext = await getFullContext(id);
                console.log('Fetched context:', blockContext);
                setContext(blockContext || "");
            } catch (error) {
                console.error("Error loading context:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadContext();
    }, [id]);

    // Log whenever context changes
    useEffect(() => {
        console.log('Current context state:', context);
    }, [context]);

    if (!id) {
        return <div>No block ID provided</div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loading /></div>;
    }

    // Check if context is empty and show a nice message
    if (!context || context.trim() === "") {
        return (
            <div className="flex flex-col gap-4 w-full">
                <BlockViewNav blockId={id} />
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold mb-3">
                            Let's try that again with some more info in your block!
                        </h2>
                        <p className="mb-6">
                            Add some content to your block first, then come back to generate FAQs.
                        </p>
                        <a 
                            href={`/dashboard/block/${id}`}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ← Back to Block
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <BlockViewNav blockId={id} />
            <div className="w-full">
                <FAQ blockId={id} text={context} />
            </div>
        </div>
    );
}
