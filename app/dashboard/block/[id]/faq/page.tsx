'use client';

import FAQ from "@/components/faq";
import { useEffect, useState, use } from "react";
import { getBlockContext } from "../../actions";
import { BlockViewNav } from "@/components/blockViewNav";

interface Props {
    params: Promise<{ id: string }>;
}

export default function FAQPage({ params }: Props) {
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
                const blockContext = await getBlockContext(id);
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
        return <div>Loading context...</div>;
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