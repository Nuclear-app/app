
export type OCRResult = {
    text: string;
    status: 'success' | 'error' | 'processing';
    error?: string;
};

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff'];
const SUPPORTED_PDF_TYPE = 'application/pdf';

export const ocr = async (selectedFile: File, blockId: string): Promise<OCRResult | null> => {
    let ocrResult: OCRResult | null = {text: '', status: 'processing'};

    if (!selectedFile) return null;
    if (!blockId) {
        throw new Error('Block ID is required for OCR processing');
    }
    
    ocrResult = ({ text: '', status: 'processing' });

    try {
        // Validate file type
        if (!SUPPORTED_IMAGE_TYPES.includes(selectedFile.type) && selectedFile.type !== SUPPORTED_PDF_TYPE) {
            throw new Error(`Unsupported file type: ${selectedFile.type}. Supported types are: ${[...SUPPORTED_IMAGE_TYPES, SUPPORTED_PDF_TYPE].join(', ')}`);
        }

        // Check file size
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (selectedFile.size > maxSize) {
            throw new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                const dataUrl = reader.result as string;
                resolve(dataUrl.split(",")[1]);
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(new Error('Failed to read file'));
            };
        });

        // Set proper MIME type for the file
        if (selectedFile.type === SUPPORTED_PDF_TYPE) {
            reader.readAsDataURL(selectedFile);
        } else {
            // For images, ensure we're sending the correct format
            const imageBlob = new Blob([selectedFile], { type: selectedFile.type });
            reader.readAsDataURL(imageBlob);
        }

        const base64 = await base64Promise;

        console.log('Sending OCR request for file:', {
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            blockId: blockId
        });

        const response = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                imageBase64: base64,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                blockId: blockId
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OCR API error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(`OCR failed: ${errorData.error || response.statusText}`);
        }

        const { text, error } = await response.json();

        if (error) {
            console.error('OCR processing error:', error);
            ocrResult = ({
                text: '',
                status: 'error',
                error: error
            });
        } else {
            ocrResult = ({
                text: text,
                status: 'success'
            });
        }
    } catch (error) {
        console.error('Error processing image:', error);
        ocrResult = ({
            text: '',
            status: 'error',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }

    return ocrResult;
};