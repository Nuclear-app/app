"use client"

import { Button } from "@/components/ui/button"
import { Settings, FileText, Star, Share2, X, Home, Zap, Flag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tree, Folder, File } from "@/components/magicui/file-tree"
import { useEffect, useState } from "react"
import { getUserFileStructureAction } from "@/lib/folderActions"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    blockId: string
    userId?: string
}

// Helper function to render tree structure
const renderTreeStructure = (structure: any[]) => {
    return structure.map((item) => {
        if (item.type === 'folder') {
            return (
                <Folder key={item.value} element={item.element} value={item.value}>
                    {item.children && item.children.length > 0 && renderTreeStructure(item.children)}
                </Folder>
            )
        } else {
            return (
                <File key={item.value} value={item.value}>
                    {item.element}
                </File>
            )
        }
    })
}

export function Sidebar({ isOpen, onClose, blockId, userId }: SidebarProps) {
    const [fileStructure, setFileStructure] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadFileStructure = async () => {
            if (!userId) {
                setLoading(false)
                return
            }

            try {
                const result = await getUserFileStructureAction(userId)
                if (result.success) {
                    setFileStructure(result.data)
                } else {
                    console.error('Failed to load file structure:', result.error)
                    setFileStructure([])
                }
            } catch (error) {
                console.error('Failed to load file structure:', error)
                setFileStructure([])
            } finally {
                setLoading(false)
            }
        }

        loadFileStructure()
    }, [userId])

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
                    <div className="flex flex-col h-full w-90 p-4">
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
                        <div className="flex-0 p-4 space-y-4 border-b border-gray-700 w-3/4">
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
                        
                        {/* Folder Tree */}
                        <div className="flex-1 overflow-y-auto p-4 py-8">
                            <div className="font-semibold mb-4">File Structure</div>
                            {loading ? (
                                <div className="text-gray-400 text-sm">Loading...</div>
                            ) : fileStructure.length > 0 ? (
                                <Tree>
                                    {renderTreeStructure(fileStructure)}
                                </Tree>
                            ) : (
                                <div className="text-gray-400 text-sm">No files found</div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="p-4 ">
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