'use client';

import Examples from "@/components/examples";
import { useEffect, useState, use } from "react";
import { getFullContext } from "../../actions";
import { generateExamplesIfNeeded } from "../actions";
import { BlockViewNav } from "@/components/blockViewNav";

interface Props {
    params: Promise<{ id: string }>;
}

export default function ExamplesPage({ params }: Props) {
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

    // Run bgFunction when examples page mounts to ensure examples are generated
    useEffect(() => {
        if (id) {
            console.log('Examples page mounted, running bgFunction for block:', id);
            generateExamplesIfNeeded(id);
        }
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
        <div className="flex flex-col gap-4">
            <BlockViewNav blockId={id} />
            <Examples blockID={id} />            
        </div>
    );
}