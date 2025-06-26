import { motion } from "framer-motion"

interface LoadingProps {
    text?: string
    className?: string
}

export function Loading({ text = "", className = "" }: LoadingProps) {
    return (
        <div className={`flex items-center space-x-2 text-2xl font-mono ${className}`}>
            <span>{text}</span>
            <motion.div
                className="w-5 h-8 bg-white"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    )
} 