import type React from "react"
import Link from "next/link"
import { Dock, DockIcon } from "./ui/dock"
import { Separator } from "./ui/separator"
import Image from "next/image"
import { Upload } from "lucide-react"
import { useEffect } from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import FileUpload, { FileState } from "@/components/fileInputComponent/fileUpload"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { fetchFiles } from "@/lib/fileUpload"
import { Skeleton } from "./ui/skeleton"
import { TooltipWrapper } from '@/components/ui/TooltipWrapper';

export type IconProps = React.HTMLAttributes<SVGElement>

export function FeatureDock({ blockId }: { blockId: string }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleFileUpload = (files: FileState[]) => {
        console.log('Uploaded files:', files);
        // Handle the uploaded files here
    };

   return (
        <div>
            <Dock direction="middle" className="border-none">
                <DockIcon size={500} className="rounded-xl bg-gradient-to-b from-[#EEEEEE]/70 to-[#EEEEEE]/70 bg-[radial-gradient(70.71%_70.71%_at_50%_50%,#9000FF_0%,#E46300_100%)] ">
                    <TooltipWrapper text="View Examples" side="bottom">
                        <Link href={`/dashboard/block/${blockId}/examples`}>
                        <div className="p-2">
                            <Image src="/features/ex.svg" alt="Ex Icon" width={24} height={24} />
                        </div>
                    </Link>
                    </TooltipWrapper>
                </DockIcon>
                <DockIcon size={500} className="rounded-xl bg-gradient-to-b from-[#EEEEEE]/70 to-[#EEEEEE]/70 bg-[radial-gradient(70.71%_70.71%_at_50%_50%,#E46300_13.75%,#00D3BE_97.99%)] ">
                    <TooltipWrapper text="Ask Nuclear" side="bottom">
                        <Link href={`/dashboard/block/${blockId}/faq`}>
                            <div className="p-2">
                                <Image src="/features/nu.svg" alt="Nu Icon" width={24} height={24} />
                            </div>
                        </Link>
                    </TooltipWrapper>
                </DockIcon>
                <DockIcon size={500} className="rounded-xl bg-gradient-to-b from-[#EEEEEE]/70 to-[#EEEEEE]/70 bg-[radial-gradient(70.71%_70.71%_at_50%_50%,#00D3BE_0%,#9000FF_100%)] ">
                    <TooltipWrapper text="Quizzes" side="bottom">
                        <Link href={`/dashboard/block/${blockId}/quizzes`}>
                            <div className="p-2">
                                <Image src="/features/qz.svg" alt="Qz Icon" width={24} height={24} />
                            </div>
                        </Link>
                    </TooltipWrapper>
            </DockIcon>
                <DockIcon className="bg-[#3C3535] rounded-xl">
                    <TooltipWrapper text="Upload Files" side="bottom">
                        <Button className="bg-transparent hover:bg-transparent" variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)}><Upload></Upload></Button>
                    </TooltipWrapper>
                </DockIcon>
         </Dock>
            {mounted && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
      </div>
    );
}

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
