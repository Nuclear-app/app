'use client'

import { useState } from 'react';
import { pdfToImg } from '@/lib/pdfToImg';
import { parseImage } from '@/lib/parseImage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const PdfOCR = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [ocrResult, setOcrResult] = useState<string[]>([]);
    const [ocrStatus, setOcrStatus] = useState<string>('');

    const extractImages = pdfToImg(selectedFile);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setOcrResult([]);
            setOcrStatus('');
        }
    }

    console.log(extractImages)

    const readPdf = async () => {
        if (!selectedFile) return;
        setOcrStatus('Processing...');
        const images = await extractImages;
        if (!images) return;
        for (const image of images) {
            // Convert Uint8Array to Blob then to File
            const blob = new Blob([image], { type: 'image/png' });
            const imageFile = new File([blob], 'page.png', { type: 'image/png' });
            const result = await parseImage(imageFile);
            if (result) {
                setOcrResult(prev => [...prev, result[0]]);
            }
        }
        setOcrStatus(ocrResult.length == images.length ? 'Success' : 'Error');
    }

    const ocrResultHtml = ocrResult.join('\n').replace(/\n/g, '<br />')
        .replace(/[=,—,-,+]/g, ' ');

    return (
        <Card className="w-full max-w-2xl mx-auto p-6">
            <CardContent className="space-y-4">
                <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="w-full"
                />

                {selectedFile && (
                    <div className="mt-4">
                        <embed
                            src={URL.createObjectURL(selectedFile)}
                            type="application/pdf"
                            width="100%"
                            height="500px"
                        />

                    </div>
                )}

                <div className="mt-4">
                    <Button
                        onClick={readPdf}
                        variant="default"
                        className="w-full sm:w-auto"
                    >
                        Submit
                    </Button>
                </div>

                <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">Status:</h4>
                    <p className={`${ocrStatus === 'Success' ? 'text-green-500' :
                            ocrStatus === 'Error' ? 'text-red-500' :
                                ocrStatus === 'Processing...' ? 'text-yellow-500' : ''
                        }`}>
                        {ocrStatus}
                    </p>
                </div>

                {ocrResult && (
                    <div className="mt-6 space-y-2">
                        <h3 className="font-semibold text-lg">Extracted Text:</h3>
                        <div className="p-4 rounded-lg border bg-background/50">
                            {ocrResultHtml}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default PdfOCR;