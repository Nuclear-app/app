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
import { ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import getBreadcrumb, { getBlockPoints } from "@/lib/blockViewNav"

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
    const [points, setPoints] = useState<number | null>(null)
    const [isPointsLoading, setIsPointsLoading] = useState(true)

    useEffect(() => {
        const fetchPoints = async () => {
            try {
                setIsPointsLoading(true)
                const data = await getBlockPoints(blockId)
                setPoints(data)
            } catch (error) {
                console.error('Error fetching points:', error)
                setPoints(0)
            } finally {
                setIsPointsLoading(false)
            }
        }
        fetchPoints()
    }, [blockId])

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
        <div className="flex items-center justify-between w-full p-4 border rounded-3xl bg-[#221D1D]">
            <div className="flex items-center gap-4">
                <Button 
                    className="bg-[#3C3535] text-white hover:opacity-50"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-4 w-4" />
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

            <div className="flex flex-col md:flex-row items-center gap-4">
                <Button 
                    className="bg-custom-gradient rounded-xl text-xl font-semibold hover:opacity-90 px-8 py-4 h-10"
                    disabled={isPointsLoading}
                >
                    {isPointsLoading ? 'Loading...' : `${points ?? 0} Points`}
                </Button>
                <Upload className="rounded-xl bg-[#3C3535] text-white p-2 w-10 h-10" />
            </div>
        </div>
    )
}
