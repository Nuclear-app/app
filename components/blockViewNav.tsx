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
import { ChevronLeft, ChevronRight, ChevronsLeft, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import getBreadcrumb from "@/lib/blockViewNav"
import { FeatureDock } from "./featureDock"
import { useRealtimePoints } from "@/hooks/useRealtimePoints"

interface blockViewNavProps {
    blockId: string
}

interface BreadcrumbItem {
    id: string
    name: string
    type: 'folder' | 'block'
}

export function BlockViewNav({ blockId }: blockViewNavProps) {
    const router = useRouter()
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // Use real-time points hook
    const { points, isLoading: isPointsLoading } = useRealtimePoints(blockId)

    useEffect(() => {
        const fetchBreadcrumbs = async () => {
            try {
                setIsLoading(true)
                const data = await getBreadcrumb(blockId)
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
        <div className="flex items-center justify-between w-full py-2 pl-4 pr-2 border rounded-3xl bg-[#221D1D]">
            <div className="flex items-center gap-4">
                <Button
                    className="bg-[#3C3535] text-white hover:opacity-50 rounded-xl aspect-square p-0"
                    onClick={() => router.back()}
                >
                    <ChevronsLeft  />
                </Button>
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
                <Button
                    className="bg-custom-gradient rounded-xl text-lg font-semibold hover:opacity-90 px-4 py-4 h-10"
                    disabled={isPointsLoading}
                >
                    {isPointsLoading ? 'Loading...' : `${points} Points`}
                </Button>
                <FeatureDock blockId={blockId} />

            </div>
        </div>
    )
}
