"use client"

import { Button } from "@/components/ui/button"
import { Settings, FileText, Star, Share2, X } from "lucide-react"
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
                    className="h-full bg-[#221D1D] border-r border-gray-700 shadow-xl overflow-hidden"
                >
                    <div className="flex flex-col h-full w-80">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Block Options</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 p-4 space-y-4">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                            >
                                <Settings className="mr-3 h-4 w-4" />
                                Settings
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                            >
                                <FileText className="mr-3 h-4 w-4" />
                                Export
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                            >
                                <Star className="mr-3 h-4 w-4" />
                                Favorite
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                            >
                                <Share2 className="mr-3 h-4 w-4" />
                                Share
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