'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ocr, OCRResult } from "@/lib/ocr";

export default function ImageOCR() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [blockId, setBlockId] = useState<string>("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setOcrResult(null);
        }
    };

    const processFile = async () => {
        if (!selectedFile) return;
        if (!blockId.trim()) {
            alert("Please enter a Block ID");
            return;
        }
        setIsProcessing(true);
        try {
            const result = await ocr(selectedFile, blockId);
            setOcrResult(result);
        } catch (error) {
            console.error("OCR processing error:", error);
            setOcrResult({
                text: '',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto p-6">
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Block ID:</label>
                    <Input
                        className="h-12"
                        type="text"
                        placeholder="Enter Block ID"
                        value={blockId}
                        onChange={(e) => setBlockId(e.target.value)}
                    />
                </div>

                <Input
                    className="h-12"
                    multiple={false}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
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
                        onClick={processFile}
                        variant="default"
                        className="w-full sm:w-auto"
                        disabled={!selectedFile || isProcessing || !blockId.trim()}
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

