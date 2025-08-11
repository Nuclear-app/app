"use client"

import { Button } from "@/components/ui/button"
import { Settings, FileText, Star, Share2, X, Home, Zap, Flag, User, LogOut, ArrowLeftToLine, MoreVertical, Trash2, Pencil, ChevronRight, ChevronDown, Upload, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Tree, Folder, File } from "@/components/magicui/file-tree"
import { useState, useEffect } from "react"
import { getUserFileStructureAction } from "@/lib/folderActions"
import { Loading } from "./loading"
import { Skeleton } from "./skeleton"
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
import { RenameBlockDialogue } from "@/components/dashboardComp/RenameBlockDialogue"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "./dialog"
import FileUpload, { FileState } from "@/components/fileInputComponent/fileUpload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchFileNames, deleteFile } from "@/app/modeSpecific/fileInput/actions"
import { SettingsPopup } from "./settings-popup"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { addBlock, addCrate } from "@/app/dashboard/actions"
import { EmojiPicker } from "frimousse"

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
    const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const fileList = await fetchFileNames(blockId);
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

    const handleDeleteFile = async (fileName: string) => {
        try {
            setDeletingFiles(prev => new Set(prev).add(fileName));
            const success = await deleteFile(blockId, fileName);
            if (success) {
                setFiles(prev => prev.filter(f => f !== fileName));
            } else {
                setError('Failed to delete file');
            }
        } catch (err) {
            setError('Failed to delete file');
            console.error(err);
        } finally {
            setDeletingFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(fileName);
                return newSet;
            });
        }
    };

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
            <AnimatePresence mode="popLayout">
                {files.map((fileName, index) => (
                    <motion.div 
                        key={fileName}
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ 
                            opacity: 0, 
                            x: 20, 
                            height: 0,
                            transition: { duration: 0.2 }
                        }}
                        transition={{ 
                            duration: 0.3,
                            ease: "easeInOut"
                        }}
                        layout
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors overflow-hidden"
                    >
                        <span className="text-sm flex-1 truncate">{fileName}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-2 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteFile(fileName)}
                            disabled={deletingFiles.has(fileName)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// Enhanced Folder component with context menu and dropdown
const EnhancedFolder = ({ element, value, children, onRename, onDelete, isDeleting }: {
    element: string
    value: string
    children: React.ReactNode
    onRename?: (id: string, newName: string) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    isDeleting?: boolean
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
        <>
            <ContextMenu>
                <ContextMenuTrigger className="w-full">
                    <div className={`relative group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Folder element={element} value={value}>
                            {children}
                        </Folder>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="h-6 w-6 p-0 hover:bg-gray-700"
                                        disabled={isDeleting}
                                    >
                                        <MoreVertical className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                    <DropdownMenuItem 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                                        onClick={() => setRenameDialogOpen(true)}
                                        disabled={isDeleting}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Rename Folder</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
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
                        disabled={isDeleting}
                    >
                        <Pencil className="h-4 w-4" />
                        <span>Rename Folder</span>
                    </ContextMenuItem>
                    <ContextMenuItem 
                        className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-[#333333]"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Folder</span>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            
            {/* Rename Folder Dialog */}
            <RenameBlockDialogue
                open={renameDialogOpen}
                onOpenChange={setRenameDialogOpen}
                currentName={element}
                onRename={handleRename}
            />
        </>
    )
}

// Enhanced File component with context menu and dropdown
const EnhancedFile = ({ element, value, onRename, onDelete, isCurrentBlock, isDeleting }: {
    element: string
    value: string
    onRename?: (id: string, newName: string) => Promise<void>
    onDelete?: (id: string) => Promise<void>
    isCurrentBlock?: boolean
    isDeleting?: boolean
}) => {
    const [renameDialogOpen, setRenameDialogOpen] = useState(false)
    const router = useRouter()

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

    const handleBlockClick = () => {
        if (isDeleting) return // Prevent navigation while deleting
        // Navigate to the block page
        router.push(`/dashboard/block/${value}`)
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger className="w-full">
                    <div className={`relative group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div 
                            className={`cursor-pointer hover:bg-gray-700/50 rounded transition-colors ${isDeleting ? 'cursor-not-allowed' : ''}`}
                            onClick={handleBlockClick}
                        >
                            <File value={value}>
                                {element}
                            </File>
                        </div>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        className="h-6 w-6 p-0 hover:bg-gray-700"
                                        disabled={isDeleting}
                                    >
                                        <MoreVertical className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-[#292929] border border-[#333333]">
                                    <DropdownMenuItem 
                                        className="flex items-center gap-2 cursor-pointer hover:bg-[#333333]"
                                        onClick={() => setRenameDialogOpen(true)}
                                        disabled={isDeleting}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span>Rename Block</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className={`flex items-center gap-2 cursor-pointer hover:bg-[#333333] ${isCurrentBlock ? 'text-gray-500 cursor-not-allowed' : 'text-red-500'}`}
                                        onClick={isCurrentBlock ? undefined : handleDelete}
                                        disabled={isCurrentBlock || isDeleting}
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
                        disabled={isDeleting}
                    >
                        <Pencil className="h-4 w-4" />
                        <span>Rename Block</span>
                    </ContextMenuItem>
                    <ContextMenuItem 
                        className={`flex items-center gap-2 cursor-pointer hover:bg-[#333333] ${isCurrentBlock ? 'text-gray-500 cursor-not-allowed' : 'text-red-500'}`}
                        onClick={isCurrentBlock ? undefined : handleDelete}
                        disabled={isCurrentBlock || isDeleting}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span>{isCurrentBlock ? 'Current Block (Cannot Delete)' : 'Delete Block'}</span>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            
            {/* Rename Block Dialog */}
            <RenameBlockDialogue
                open={renameDialogOpen}
                onOpenChange={setRenameDialogOpen}
                currentName={element}
                onRename={handleRename}
            />
        </>
    )
}

// Form schemas for block and crate creation
const blockFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
});

const crateFormSchema = z.object({
    title: z.string().min(1, {
        message: "Title is required.",
    }).max(50, {
        message: "Title must be less than 50 characters.",
    }),
    icon: z.string(),
});

export function Sidebar({ isOpen, onClose, blockId, userId }: SidebarProps) {
    const [fileStructure, setFileStructure] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
    const [isCreateNewOpen, setIsCreateNewOpen] = useState(false)
    const [isCreateBlockOpen, setIsCreateBlockOpen] = useState(false)
    const [isCreateCrateOpen, setIsCreateCrateOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set())
    const [selectedEmoji, setSelectedEmoji] = useState<string>("📁")
    const router = useRouter()

    // Form instances
    const blockForm = useForm<z.infer<typeof blockFormSchema>>({
        resolver: zodResolver(blockFormSchema),
        defaultValues: {
            title: "",
        },
    });

    const crateForm = useForm<z.infer<typeof crateFormSchema>>({
        resolver: zodResolver(crateFormSchema),
        defaultValues: {
            title: "",
            icon: "📁",
        },
    });

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    useEffect(() => {
        const loadFileStructure = async () => {
            console.log('Loading file structure, userId:', userId)
            
            if (!userId) {
                console.log('No userId provided, setting loading to false')
                setLoading(false)
                return
            }

            setLoading(true) // Ensure loading is true when starting
            console.log('Starting to load file structure...')

            // Add a small delay to ensure loading state is visible
            await new Promise(resolve => setTimeout(resolve, 500))

            try {
                const result = await getUserFileStructureAction(userId)
                console.log('File structure result:', result)
                if (result.success) {
                    setFileStructure(result.data)
                    console.log('File structure data:', result.data)
                } else {
                    console.error('Failed to load file structure:', result.error)
                    setFileStructure([])
                }
            } catch (error) {
                console.error('Failed to load file structure:', error)
                setFileStructure([])
            } finally {
                console.log('Setting loading to false')
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
            
            // Add to deleting set for animation
            setDeletingItems(prev => new Set(prev).add(blockIdToDelete))
            
            await deleteBlock(blockIdToDelete)
            
            // Remove from deleting set
            setDeletingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(blockIdToDelete)
                return newSet
            })
            
            // Refresh the file structure after delete
            const result = await getUserFileStructureAction(userId || "")
            if (result.success) {
                setFileStructure(result.data)
            }
        } catch (error) {
            console.error("Failed to delete block:", error)
            // Remove from deleting set on error
            setDeletingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(blockIdToDelete)
                return newSet
            })
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
            // Add to deleting set for animation
            setDeletingItems(prev => new Set(prev).add(folderId))
            
            await deleteCrate(folderId)
            
            // Remove from deleting set
            setDeletingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(folderId)
                return newSet
            })
            
            // Refresh the file structure after delete
            const result = await getUserFileStructureAction(userId || "")
            if (result.success) {
                setFileStructure(result.data)
            }
        } catch (error) {
            console.error("Failed to delete folder:", error)
            // Remove from deleting set on error
            setDeletingItems(prev => {
                const newSet = new Set(prev)
                newSet.delete(folderId)
                return newSet
            })
        }
    }

    // Block creation handler
    const handleCreateBlock = async (title: string) => {
        try {
            const block = await addBlock(title, undefined); // Root level block
            setIsCreateBlockOpen(false);
            blockForm.reset();
            router.push(`/onboarding/name/study-type?blockId=${block.id}&newBlock=false`);
        } catch (error) {
            console.error("Failed to create block:", error);
        }
    };

    // Crate creation handler
    const handleCreateCrate = async (title: string, icon: string) => {
        try {
            const crate = await addCrate(title, icon, undefined); // Root level crate
            setIsCreateCrateOpen(false);
            crateForm.reset();
            // Optionally refresh the sidebar or navigate
            router.push(`/dashboard/crate/${crate.id}`);
        } catch (error) {
            console.error("Failed to create crate:", error);
        }
    };

    // Reset forms when dialogs are closed
    useEffect(() => {
        if (!isCreateBlockOpen) {
            blockForm.reset();
        }
    }, [isCreateBlockOpen, blockForm]);

    useEffect(() => {
        if (!isCreateCrateOpen) {
            crateForm.reset();
            setSelectedEmoji("📁");
        }
    }, [isCreateCrateOpen, crateForm]);

    // Helper function to render tree structure with enhanced components
    const renderTreeStructure = (structure: any[], onRenameBlock?: (id: string, newName: string) => Promise<void>, onDeleteBlock?: (id: string) => Promise<void>, onRenameFolder?: (id: string, newName: string) => Promise<void>, onDeleteFolder?: (id: string) => Promise<void>) => {
        return (
            <AnimatePresence mode="popLayout">
                {structure.map((item) => {
                    if (item.type === 'folder') {
                        return (
                            <motion.div
                                key={item.value}
                                layout
                                initial={{ opacity: 1, scale: 1 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    x: -50,
                                    transition: {
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }
                                }}
                                transition={{
                                    duration: 0.2,
                                    layout: { duration: 0.3 }
                                }}
                            >
                                <EnhancedFolder 
                                    element={item.element} 
                                    value={item.value}
                                    onRename={onRenameFolder}
                                    onDelete={onDeleteFolder}
                                    isDeleting={deletingItems.has(item.value)}
                                >
                                    {item.children && item.children.length > 0 && renderTreeStructure(item.children, onRenameBlock, onDeleteBlock, onRenameFolder, onDeleteFolder)}
                                </EnhancedFolder>
                            </motion.div>
                        )
                    } else {
                        return (
                            <motion.div
                                key={item.value}
                                layout
                                initial={{ opacity: 1, scale: 1 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    x: -50,
                                    transition: {
                                        duration: 0.3,
                                        ease: "easeInOut"
                                    }
                                }}
                                transition={{
                                    duration: 0.2,
                                    layout: { duration: 0.3 }
                                }}
                            >
                                <EnhancedFile 
                                    element={item.element} 
                                    value={item.value}
                                    onRename={onRenameBlock}
                                    onDelete={onDeleteBlock}
                                    isCurrentBlock={item.value === blockId}
                                    isDeleting={deletingItems.has(item.value)}
                                />
                            </motion.div>
                        )
                    }
                })}
            </AnimatePresence>
        )
    }

    console.log('Sidebar render - loading:', loading, 'fileStructure length:', fileStructure.length, 'userId:', userId)
    
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
                        
                        {/* Separator */}
                        <Separator className="bg-[#8A8888]" />
                        
                        {/* Features */}
                        <div className="flex-0 p-4 space-y-4 w-3/4">
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

                        </div>
                        
                        {/* Separator */}
                        <Separator className="bg-[#8A8888] h-1 rounded-full my-2" />

                        {/* File Management + Create New Combo */}
                        <div className="flex items-center justify-between p-2 gap-2">
                            <Button 
                                className="text-lg font-semibold w-4/5 rounded-xl justify-start h-10"
                                onClick={() => setIsFileDialogOpen(true)}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Sources
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsCreateNewOpen(true)}
                                className="hover:bg-[#3C373588] bg-[#3C3735] rounded-xl w-1/5 h-10"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Folder Tree */}
                        <div className="flex-1 overflow-y-auto p-4 py-8">
                            {(loading || (!loading && fileStructure.length === 0 && userId)) ? (
                                <div className="space-y-3">
                                    {/* Root level skeleton items */}
                                    {[...Array(3)].map((_, index) => (
                                        <div key={`root-${index}`} className="space-y-2">
                                            {/* Folder skeleton */}
                                            <div className="flex items-center space-x-2">
                                                <Skeleton className="h-4 w-4" /> {/* Chevron */}
                                                <Skeleton className="h-4 w-4" /> {/* Folder icon */}
                                                <Skeleton className="h-4 w-32" /> {/* Folder name */}
                                            </div>
                                            {/* Nested items skeleton */}
                                            {index === 0 && (
                                                <div className="ml-6 space-y-2">
                                                    {[...Array(2)].map((_, subIndex) => (
                                                        <div key={`nested-${subIndex}`} className="flex items-center space-x-2">
                                                            <Skeleton className="h-4 w-4" /> {/* File icon */}
                                                            <Skeleton className="h-4 w-24" /> {/* File name */}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
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
                            ) : userId ? (
                                <div className="">No files found {":("} </div>
                            ) : null}
                        </div>
                        
                        {/* Separator */}
                        <Separator className="bg-[#8A8888]" />
                        
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
                                onClick={() => setIsSettingsOpen(true)}
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

                    {/* Create New Dialog */}
                    {mounted && (
                        <Dialog open={isCreateNewOpen} onOpenChange={setIsCreateNewOpen}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Create New</DialogTitle>
                                    <DialogDescription>
                                        Create a new block or crate.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col space-y-4 mt-4">
                                    <Button
                                        className="w-full justify-start h-12 text-lg"
                                        onClick={() => {
                                            setIsCreateNewOpen(false);
                                            setIsCreateBlockOpen(true);
                                        }}
                                    >
                                        <FileText className="mr-3 h-5 w-5" />
                                        New Block
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-12 text-lg"
                                        onClick={() => {
                                            setIsCreateNewOpen(false);
                                            setIsCreateCrateOpen(true);
                                        }}
                                    >
                                        <Star className="mr-3 h-5 w-5" />
                                        New Crate
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Create Block Dialog */}
                    {mounted && (
                        <Dialog open={isCreateBlockOpen} onOpenChange={setIsCreateBlockOpen}>
                            <DialogContent className="bg-[#161616] border-2">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Create New Block</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Enter a name for your new block.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...blockForm}>
                                    <form onSubmit={blockForm.handleSubmit((values) => handleCreateBlock(values.title))} className="space-y-4">
                                        <FormField
                                            control={blockForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="bg-[#292929] border rounded-md p-2" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit">Create Block</Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Create Crate Dialog */}
                    {mounted && (
                        <Dialog open={isCreateCrateOpen} onOpenChange={setIsCreateCrateOpen}>
                            <DialogContent className="bg-[#161616] border-2">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Create New Crate</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Choose an emoji and name for your new crate.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...crateForm}>
                                    <form onSubmit={crateForm.handleSubmit((values) => handleCreateCrate(values.title, values.icon))} className="space-y-4">
                                        <FormField
                                            control={crateForm.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="bg-[#292929] border rounded-md p-2" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={crateForm.control}
                                            name="icon"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Icon</FormLabel>
                                                    <FormControl>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl">{selectedEmoji}</span>
                                                                <span className="text-sm text-gray-400">Selected emoji</span>
                                                            </div>
                                                            <div className="max-h-[300px] overflow-y-auto">
                                                                <EmojiPicker.Root 
                                                                    className="isolate flex w-fit flex-col bg-[#292929] dark:bg-neutral-900"
                                                                    onEmojiSelect={(selection) => {
                                                                        setSelectedEmoji(selection.emoji);
                                                                        field.onChange(selection.emoji);
                                                                    }}
                                                                >
                                                                    <EmojiPicker.Search className="z-10 mx-2 mt-2 appearance-none rounded-md bg-[#333333] px-2.5 py-2 text-sm text-white dark:bg-neutral-800" />
                                                                    <EmojiPicker.Viewport className="relative flex-1 outline-hidden">
                                                                        <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                                                                            Loading…
                                                                        </EmojiPicker.Loading>
                                                                        <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm dark:text-neutral-500">
                                                                            No emoji found.
                                                                        </EmojiPicker.Empty>
                                                                        <EmojiPicker.List
                                                                            className="select-none pb-1.5"
                                                                            components={{
                                                                                CategoryHeader: ({ category, ...props }) => (
                                                                                    <div
                                                                                        className="bg-[#292929] px-3 pt-3 pb-1.5 font-medium text-neutral-400 text-xs dark:bg-neutral-900"
                                                                                        {...props}
                                                                                    >
                                                                                        {category.label}
                                                                                    </div>
                                                                                ),
                                                                                Row: ({ children, ...props }) => (
                                                                                    <div className="scroll-my-1.5 px-1.5" {...props}>
                                                                                        {children}
                                                                                    </div>
                                                                                ),
                                                                                Emoji: ({ emoji, ...props }) => (
                                                                                    <button
                                                                                        type="button"
                                                                                        className="flex size-8 items-center justify-center rounded-md text-lg data-[active]:bg-[#333333] dark:data-[active]:bg-neutral-800"
                                                                                        {...props}
                                                                                    >
                                                                                        {emoji.emoji}
                                                                                    </button>
                                                                                ),
                                                                            }}
                                                                        />
                                                                    </EmojiPicker.Viewport>
                                                                </EmojiPicker.Root>
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit">Create Crate</Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Settings Popup */}
                    <SettingsPopup 
                        open={isSettingsOpen} 
                        onOpenChange={setIsSettingsOpen} 
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
} 