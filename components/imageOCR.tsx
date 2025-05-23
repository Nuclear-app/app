'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type OCRResult = {
    text: string;
    status: 'success' | 'error' | 'processing';
    error?: string;
};

export default function ImageOCR() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
            setOcrResult(null);
        }
    };

    const processImage = async () => {
        if (!selectedImage) return;

        setIsProcessing(true);
        setOcrResult({ text: '', status: 'processing' });

        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const dataUrl = reader.result as string;
                    // dataUrl: "data:application/pdf;base64,AAAA..."
                    resolve(dataUrl.split(",")[1]);
                };
                reader.onerror = reject;
            });
            if (selectedImage.type === "application/pdf") {
                reader.readAsDataURL(selectedImage);
            } else {
                reader.readAsDataURL(selectedImage);
            }
            const base64 = await base64Promise;

            const response = await fetch("/api/ocr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    imageBase64: base64,
                    fileName: selectedImage.name 
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { text, error } = await response.json();

            if (error) {
                setOcrResult({
                    text: '',
                    status: 'error',
                    error: error
                });
            } else {
                setOcrResult({
                    text: text,
                    status: 'success'
                });
            }
        } catch (error) {
            console.error('Error processing image:', error);
            setOcrResult({
                text: '',
                status: 'error',
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto p-6">
            <CardContent className="space-y-4">
                <Input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
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
                        onClick={processImage}
                        variant="default"
                        className="w-full sm:w-auto"
                        disabled={!selectedImage || isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Extract Text'}
                    </Button>
                </div>

                {ocrResult && (
                    <>
                        <div className="mt-6 space-y-2">
                            <h4 className="font-semibold">Status:</h4>
                            <p className={`${ocrResult.status === 'success' ? 'text-green-500' :
                                ocrResult.status === 'error' ? 'text-red-500' :
                                    ocrResult.status === 'processing' ? 'text-yellow-500' : ''
                                }`}>
                                {ocrResult.status === 'processing' ? 'Processing...' :
                                    ocrResult.status === 'success' ? 'Success' :
                                        'Error'}
                            </p>
                        </div>

                        {ocrResult.status === 'success' && (
                            <div className="mt-6 space-y-2">
                                <h3 className="font-semibold text-lg">Extracted Text:</h3>
                                <div
                                    className="p-4 rounded-lg border bg-background/50"
                                    dangerouslySetInnerHTML={{
                                        __html: ocrResult.text
                                            .replace(/\n/g, '<br />')
                                            .replace(/[=,—,-,+]/g, ' ') || '',
                                    }}
                                />
                            </div>
                        )}

                        {ocrResult.status === 'error' && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-semibold text-red-700">Error:</h4>
                                <p className="text-red-600">{ocrResult.error}</p>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

