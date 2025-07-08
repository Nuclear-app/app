import { ny } from "@/lib/utils";

interface LoadingTextProps {
    text?: string;
    className?: string;
}

export function LoadingText({ text = "Loading note content", className }: LoadingTextProps) {
    return (
        <div className={ny("flex items-center gap-2 text-muted-foreground", className)}>
            <span>{text}</span>
            <span className="inline-block w-1 h-4 bg-muted-foreground animate-blink" />
            <span className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
        </div>
    );
} 