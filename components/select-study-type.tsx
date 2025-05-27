'use client'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card"
import Image from "next/image"

interface SelectStudyTypeProps {
    image: string,
    title: string,
    description: string,
    onClick: () => void
}

const SelectStudyType: React.FC<SelectStudyTypeProps> = ({ image, title, description, onClick }) => {
    return (
        <div onClick={onClick} className="cursor-pointer">
            <Card className="bg-transparent border-none shadow-none hover:bg-white/5 transition-colors">
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
        </div>
    )
}

export default SelectStudyType 