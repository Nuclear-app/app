"use client"

import { Button } from "@/components/ui/button"
import { Settings, FileText, Star, Share2, X, Home, Zap, Flag, User, LogOut, ArrowLeftToLine, MoreVertical, Trash2, Pencil, ChevronRight, ChevronDown, Upload } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tree, Folder, File } from "@/components/magicui/file-tree"
import { useEffect, useState } from "react"
import { getUserFileStructureAction } from "@/lib/folderActions"
import { Loading } from "./loading"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateBlockTitle, deleteBlock, deleteCrate, renameFolderAction } from "@/app/dashboard/actions"
import { RenameDialogue } from "@/components/dashboardComp/RenameDialogue"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"
import FileUpload, { FileState } from "@/components/fileInputComponent/fileUpload"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { fetchFiles } from "@/lib/fileUpload"
import { Skeleton } from "./skeleton"

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    blockId: string
    userId?: string
}

// FileHistory component (exact copy from featureDock.tsx)
const FileHistory = ({ blockId }: { blockId: string }) => {
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const fileList = await fetchFiles(blockId);
                setFiles(fileList || []);
            } catch (err) {
                setError('Failed to load files');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadFiles();
    }, [blockId]);

    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-2">
                        <Skeleton className="h-4 w-[250px]" />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }

    if (files.length === 0) {
        return <div className="text-muted-foreground p-4">No files uploaded yet</div>;
    }

    return (
        <div className="space-y-2">
            {files.map((fileName, index) => (
                <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                >
                    <span className="text-sm">{fileName}</span>
                </div>
            ))}
        </div>
    );
};

// Enhanced Folder component with context menu and dropdown
const EnhancedFolder = ({ element, value, children, onRename, onDelete }: {
    element: string
    value: string
    children: React.ReactNode
    onRename?: (id: string, newName: string) => Promise<void>
    onDelete?: (id: string) => Promise<void>
}) => {
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)

    const handleRename = async (newName: string) => {
        try {
            await onRename?.(value, newName)
            setRenameDialogOpen(false)
        } catch (error) {
            console.error("Failed to rename folder:", error)
        }
    }

    const handleDelete = async () => {
        try {
            await onDelete?.(value)
        } catch (error) {
            console.error("Failed to delete folder:", error)
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full">
                <div className="relative group">
                    <Folder element={element} value={value}>
                        {children}
                    </Folder>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-700">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                <DropdownMenuItem 
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                                    onClick={() => setRenameDialogOpen(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span>Rename Folder</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Folder</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-[#292929] border border-[#333333]">
                <ContextMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                    onClick={() => setRenameDialogOpen(true)}
                >
                    <Pencil className="h-4 w-4" />
                    <span>Rename Folder</span>
                </ContextMenuItem>
                <ContextMenuItem 
                    className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Folder</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}

// Enhanced File component with context menu and dropdown
const EnhancedFile = ({ element, value, onRename, onDelete, isCurrentBlock }: {
    element: string
    value: string
    onRename?: (id: string, newName: string) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    isCurrentBlock?: boolean
}) => {
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)

    const handleRename = async (newName: string) => {
        try {
            await onRename?.(value, newName)
            setRenameDialogOpen(false)
        } catch (error) {
            console.error("Failed to rename block:", error)
        }
    }

    const handleDelete = async () => {
        try {
            await onDelete?.(value)
        } catch (error) {
            console.error("Failed to delete block:", error)
        }
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger className="w-full">
                <div className="relative group">
                    <File value={value}>
                        {element}
                    </File>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-700">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                <DropdownMenuItem 
                                    className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                                    onClick={() => setRenameDialogOpen(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span>Rename Block</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className={`flex items-center gap-2 cursor-pointer hover:bg-[#333333] ${isCurrentBlock ? 'text-gray-500 cursor-not-allowed' : 'text-red-500'}`}
                                    onClick={isCurrentBlock ? undefined : handleDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>{isCurrentBlock ? 'Current Block (Cannot Delete)' : 'Delete Block'}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-[#292929] border border-[#333333]">
                <ContextMenuItem 
                    className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                    onClick={() => setRenameDialogOpen(true)}
                >
                    <Pencil className="h-4 w-4" />
                    <span>Rename Block</span>
                </ContextMenuItem>
                <ContextMenuItem 
                    className={`flex items-center gap-2 cursor-pointer hover:bg-[#333333] ${isCurrentBlock ? 'text-gray-500 cursor-not-allowed' : 'text-red-500'}`}
                    onClick={isCurrentBlock ? undefined : handleDelete}
                >
                    <Trash2 className="h-4 w-4" />
                    <span>{isCurrentBlock ? 'Current Block (Cannot Delete)' : 'Delete Block'}</span>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}

export function Sidebar({ isOpen, onClose, blockId, userId }: SidebarProps) {
    const [fileStructure, setFileStructure] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

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

    const handleFileUpload = (files: FileState[]) => {
        console.log('Uploaded files:', files);
        // Handle the uploaded files here
    };

    // Handlers for tree operations
    const handleRenameBlock = async (blockIdToRename: string, newTitle: string) => {
        try {
            await updateBlockTitle(blockIdToRename, newTitle)
            // Refresh the file structure after rename
            const result = await getUserFileStructureAction(userId || "")
            if (result.success) {
                setFileStructure(result.data)
            }
        } catch (error) {
            console.error("Failed to rename block:", error)
        }
    }

    const handleDeleteBlock = async (blockIdToDelete: string) => {
        try {
            // Check if this is the current block
            if (blockIdToDelete === blockId) {
                // Redirect to dashboard instead of deleting
                router.push('/dashboard')
                return
            }
            
            await deleteBlock(blockIdToDelete)
            // Refresh the file structure after delete
            const result = await getUserFileStructureAction(userId || "")
            if (result.success) {
                setFileStructure(result.data)
            }
        } catch (error) {
            console.error("Failed to delete block:", error)
        }
    }

    const handleRenameFolder = async (folderId: string, newName: string) => {
        try {
            await renameFolderAction(folderId, newName)
            // Refresh the file structure after rename
            const result = await getUserFileStructureAction(userId || "")
            if (result.success) {
                setFileStructure(result.data)
            }
        } catch (error) {
            console.error("Failed to rename folder:", error)
        }
    }

    const handleDeleteFolder = async (folderId: string) => {
        try {
            await deleteCrate(folderId)
            // Refresh the file structure after delete
            const result = await getUserFileStructureAction(userId || "")
            if (result.success) {
                setFileStructure(result.data)
            }
        } catch (error) {
            console.error("Failed to delete folder:", error)
        }
    }

    // Helper function to render tree structure with enhanced components
    const renderTreeStructure = (structure: any[], onRenameBlock?: (id: string, newName: string) => Promise<void>, onDeleteBlock?: (id: string) => Promise<void>, onRenameFolder?: (id: string, newName: string) => Promise<void>, onDeleteFolder?: (id: string) => Promise<void>) => {
        return structure.map((item) => {
            if (item.type === 'folder') {
                return (
                    <EnhancedFolder 
                        key={item.value} 
                        element={item.element} 
                        value={item.value}
                        onRename={onRenameFolder}
                        onDelete={onDeleteFolder}
                    >
                        {item.children && item.children.length > 0 && renderTreeStructure(item.children, onRenameBlock, onDeleteBlock, onRenameFolder, onDeleteFolder)}
                    </EnhancedFolder>
                )
            } else {
                return (
                    <EnhancedFile 
                        key={item.value} 
                        element={item.element} 
                        value={item.value}
                        onRename={onRenameBlock}
                        onDelete={onDeleteBlock}
                        isCurrentBlock={item.value === blockId}
                    />
                )
            }
        })
    }

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
                            <Button 
                                className="text-lg font-semibold w-4/5 rounded-xl justify-start h-10"
                                onClick={() => router.push('/dashboard')}
                            >
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hover:bg-[#3C373588] bg-[#3C3735] rounded-xl w-1/5 h-10"
                            >
                                <ArrowLeftToLine className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        {/* Features */}
                        <div className="flex-0 p-4 space-y-4 border-b border-gray-700 w-3/4">
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-bold text-lg text-[#77D0E0] hover:bg-gray-800"
                                onClick={() => router.push(`/dashboard/block/${blockId}/quiz`)}
                            >
                                <Flag className="mr-3 h-4 w-4" />
                                Quizzes
                            </Button>
                            
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-bold text-lg text-[#E9A877] hover:text-white hover:bg-gray-800"
                                onClick={() => router.push(`/dashboard/block/${blockId}/flashcard`)}
                            >
                                <Zap className="mr-3 h-4 w-4" />
                                Flashcards
                            </Button>

                            {/* File Management Button */}
                            <Button
                                variant="ghost"
                                className="w-full justify-start font-bold text-lg text-[#90EE90] hover:text-white hover:bg-gray-800"
                                onClick={() => setIsFileDialogOpen(true)}
                            >
                                <Upload className="mr-3 h-4 w-4" />
                                File Management
                            </Button>
                        </div>
                        
                        {/* Folder Tree */}
                        <div className="flex-1 overflow-y-auto p-4 py-8">
                            {loading ? (
                                <Loading></Loading>
                            ) : fileStructure.length > 0 ? (
                                <Tree
                                    openIcon={<ChevronDown className="size-4" />}
                                    closeIcon={<ChevronRight className="size-4" />}
                                >
                                    {renderTreeStructure(
                                        fileStructure, 
                                        handleRenameBlock, 
                                        handleDeleteBlock, 
                                        handleRenameFolder, 
                                        handleDeleteFolder
                                    )}
                                </Tree>
                            ) : (
                                <div className="">No files found {":("} </div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between p-2 gap-2">
                            <Button
                                className=" text-lg font-semibold w-4/5 rounded-xl justify-start h-10 bg-[#3C3735] text-white"
                                onClick={async () => {
                                    const supabase = createClient()
                                    await supabase.auth.signOut()
                                    router.push('/')
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                            <Button
                                size="icon"
                                className="hover:bg-[#3C373588] bg-[#3C3735] rounded-xl w-1/5 h-10 text-white"
                            >
                                <User className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs px-4 text-gray-400">
                            Nuclear's made by penguins on mars 🪐
                        </div>
                    </div>

                    {/* File Management Dialog */}
                    {mounted && (
                        <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                            <DialogContent className="sm:max-w-1/2">
                                <DialogHeader>
                                    <DialogTitle>File Management</DialogTitle>
                                    <DialogDescription>
                                        Upload new files or view your existing files.
                                    </DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="upload">Upload Files</TabsTrigger>
                                        <TabsTrigger value="history">File History</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="mt-4">
                                        <FileUpload returnFiles={handleFileUpload} mode="upload" blockId={blockId} newBlock={false} />
                                    </TabsContent>
                                    <TabsContent value="history" className="mt-4">
                                        <FileHistory blockId={blockId} />
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
} 