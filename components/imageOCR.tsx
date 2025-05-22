'use client'

import { useState } from 'react'
import { parseImage } from '@/lib/parseImage'
import { createWorker } from 'tesseract.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

const ImageOCR = () => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [ocrResult, setOcrResult] = useState<string | null>('');
    const [ocrStatus, setOcrStatus] = useState<string | null>('');

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
            setOcrResult('');
            setOcrStatus('');
        }
    }
    
    // const readImageText = async () => {
    //     if (!selectedImage) return;
    //     setOcrStatus('Processing...');
    //     const worker = await createWorker('eng', 1, {
    //         logger: m => console.log(m),
    //     });
        
    //     try {
    //         const {
    //             data: { text }
    //         } = await worker.recognize(selectedImage);
    //         setOcrResult(text);
    //         setOcrStatus('Success');
    //     } catch (error) {
    //         console.error('Error reading image:', error);
    //         setOcrStatus('Error');
    //     } finally {
    //         await worker.terminate();
    //     }
    // };
    const readImageText = async () => {
        if (!selectedImage) return;
        setOcrStatus('Processing...');
        const result = await parseImage(selectedImage);
        if (result) {
            setOcrResult(result[0]);
            setOcrStatus(result[1]);
        }
    }

    return (
        <Card className="w-full max-w-2xl mx-auto p-6">
            <CardContent className="space-y-4">
                <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="w-full"
                />

                {selectedImage && (
                    <div className="mt-4">
                        <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Uploaded content"
                            className="w-full max-w-md mx-auto rounded-lg"
                        />
                    </div>
                )}

                <div className="mt-4">
                    <Button
                        onClick={readImageText}
                        variant="default"
                        className="w-full sm:w-auto"
                    >
                        Submit
                    </Button>
                </div>

                <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">Status:</h4>
                    <p className={`${
                        ocrStatus === 'Success' ? 'text-green-500' :
                        ocrStatus === 'Error' ? 'text-red-500' :
                        ocrStatus === 'Processing...' ? 'text-yellow-500' : ''
                    }`}>
                        {ocrStatus}
                    </p>
                </div>

                {ocrResult && (
                    <div className="mt-6 space-y-2">
                        <h3 className="font-semibold text-lg">Extracted Text:</h3>
                        {/* <div 
                            className="p-4 rounded-lg border bg-background/50"
                            dangerouslySetInnerHTML={{
                                __html: ocrResult.replace(/\n/g, '<br />')
                                    .replace(/[=,—,-,+]/g, ' ') || '',
                            }}
                        /> */}
                        <div className="p-4 rounded-lg border bg-background/50">
                            {ocrResult}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default ImageOCR;