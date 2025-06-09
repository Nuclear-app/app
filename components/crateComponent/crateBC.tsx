import * as React from "react";
import { CratePath } from "@/app/dashboard/actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface CrateBreadcrumbProps {
    cratePath: CratePath[];
}

export function CrateBreadcrumb({ cratePath }: CrateBreadcrumbProps) {
    return (
        <div className="flex flex-col gap-4 mb-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    {cratePath.map((crate, index) => (
                        index === cratePath.length - 1 ? (
                            <BreadcrumbItem key={crate.id}>
                                <BreadcrumbPage>{crate.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        ) : (
                            <React.Fragment key={crate.id}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/dashboard/crate/${crate.id}`}>
                                        {crate.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </React.Fragment>
                        )
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
} 