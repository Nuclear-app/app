"use client"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ArrowRightToLine, ChevronLeft, ChevronRight, ChevronsLeft, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getBreadcrumbData } from "@/app/dashboard/block/[id]/actions"
import { FeatureDock } from "./featureDock"
import { useRealtimePoints } from "@/hooks/useRealtimePoints"
import { TooltipWrapper } from "./ui/TooltipWrapper"
import { Sidebar } from "./ui/sidebar"
import { getCurrentUserAction } from "@/app/dashboard/actions"
import { User } from "@prisma/client"

interface blockViewNavProps {
    blockId: string
    children?: React.ReactNode
}

interface BreadcrumbItem {
    id: string
    name: string
    type: 'folder' | 'block'
}

export function BlockViewNav({ blockId, children }: blockViewNavProps) {
    const router = useRouter()
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    // Use real-time points hook
    const { points, isLoading: isPointsLoading } = useRealtimePoints(blockId)

    useEffect(() => {
        const fetchUser = async () => {
            const user = await getCurrentUserAction()
            setUser(user)
        }
        fetchUser()

        const fetchBreadcrumbs = async () => {
            try {
                setIsLoading(true)
                const data = await getBreadcrumbData(blockId)
                setBreadcrumbs(data)
            } catch (error) {
                console.error('Error fetching breadcrumbs:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBreadcrumbs()
    }, [blockId])

    return (
        <div className="flex h-full">
            {/* Sidebar - Full Height */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                blockId={blockId}
                userId={user?.id || undefined}
            />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 p-4">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between w-full py-2 pl-4 pr-2 rounded-3xl mb-4">
                    <div className="flex items-center gap-4">

                        {!isSidebarOpen && (
                            <TooltipWrapper text="Menu" side="bottom">
                                <Button
                                    className="bg-[#221D1D] text-white hover:bg-[#3C3535]/70 rounded-xl aspect-square p-0"
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                    <ArrowRightToLine className="h-5 w-5" />
                                </Button>
                            </TooltipWrapper>
                        )}

                        <TooltipWrapper text="Back" side="bottom">
                            <Button
                                className="bg-[#221D1D] text-white hover:bg-[#3C3535]/70 rounded-xl aspect-square p-0"
                                onClick={() => router.back()}
                            >
                                <ChevronsLeft />
                            </Button>
                        </TooltipWrapper>



                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                {!isLoading && breadcrumbs.length > 0 && (
                                    <>
                                        {breadcrumbs.slice(1, -1).map((item) => (
                                            <BreadcrumbItem key={item.id}>
                                                <BreadcrumbSeparator>
                                                    <ChevronRight className="h-4 w-4" />
                                                </BreadcrumbSeparator>
                                                <BreadcrumbLink href={`/dashboard/crate/${item.id}`}>
                                                    {item.name}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                        ))}
                                        <BreadcrumbItem>
                                            <BreadcrumbSeparator>
                                                <ChevronRight className="h-4 w-4" />
                                            </BreadcrumbSeparator>
                                            <BreadcrumbPage>
                                                {breadcrumbs[breadcrumbs.length - 1]?.name || 'Loading...'}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                                {isLoading && (
                                    <BreadcrumbItem>
                                        <BreadcrumbSeparator>
                                            <ChevronRight className="h-4 w-4" />
                                        </BreadcrumbSeparator>
                                        <BreadcrumbPage>Loading...</BreadcrumbPage>
                                    </BreadcrumbItem>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-1">
                        <TooltipWrapper text="Points" side="bottom">
                            <Button
                                className="bg-[#9000ff88] rounded-xl text-lg font-semibold hover:opacity-90 px-4 py-4 h-10"
                                disabled={isPointsLoading}
                            >
                                {isPointsLoading ? 'Loading...' : `${points} Points`}
                            </Button>
                        </TooltipWrapper>
                        {/* <FeatureDock blockId={blockId} /> */}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    )
}
