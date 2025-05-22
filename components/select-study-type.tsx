'use client'

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card"
import Image from "next/image"

interface SelectStudyTypeProps {
    image: string,
    title: string,
    description: string
    link: string
}

const SelectStudyType: React.FC<SelectStudyTypeProps> = ({ image, title, description, link }) => {
    return (
        <div>
            <Link href={link}>
                <Card className="bg-transparent border-none shadow-none">
                    <CardHeader>
                        <Image src={image} alt={title} width={200} height={200} />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="font-black">
                            {title}
                        </CardTitle>
                    </CardContent>
                    <CardFooter className="font-light text-sm">
                        <div>{description}</div>
                    </CardFooter>
                </Card>
            </Link>
        </div>
    )
}

export default SelectStudyType 