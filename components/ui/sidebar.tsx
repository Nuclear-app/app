"use client"

import { Button } from "@/components/ui/button"
import { Settings, FileText, Star, Share2, X, Home, Zap, Flag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    blockId: string
}

export function Sidebar({ isOpen, onClose, blockId }: SidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 320 }}
                    exit={{ width: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="h-screen bg-[#221D1D] border-r border-gray-700 shadow-xl overflow-hidden flex-shrink-0"
                >
                    <div className="flex flex-col h-full w-80 p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between p-2 gap-2">
                            <Button className="text-lg font-semibold w-4/5 rounded-xl justify-start h-10">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hover:bg-[#3C373588] bg-[#3C3735] rounded-xl w-1/5 h-10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        {/* Features */}
                        <div className="flex-0 p-4 space-y-4 border-b border-red-600">
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-bold text-lg text-[#77D0E0] hover:bg-gray-800"
                            >
                                <Flag className="mr-3 h-4 w-4" />
                                Quizzes
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-bold text-lg text-[#E9A877] hover:text-white hover:bg-gray-800"
                            >
                                <Zap className="mr-3 h-4 w-4" />
                                Flashcards
                            </Button>
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                                Block ID: {blockId}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
} 