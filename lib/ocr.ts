export type OCRResult = {
    text: string;
    status: 'success' | 'error' | 'processing';
    error?: string;
};

export const ocr = async (selectedFile: File): Promise<OCRResult | null> => {
    let ocrResult: OCRResult | null = {text: '', status: 'processing'};

    if (!selectedFile) return null;
    ocrResult = ({ text: '', status: 'processing' });

    try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
                const dataUrl = reader.result as string;
                resolve(dataUrl.split(",")[1]);
            };
            reader.onerror = reject;
        });
        if (selectedFile.type === "application/pdf") {
            reader.readAsDataURL(selectedFile);
        } else {
            reader.readAsDataURL(selectedFile);
        }
        const base64 = await base64Promise;

        const response = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                imageBase64: base64,
                fileName: selectedFile.name 
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { text, error } = await response.json();

        if (error) {
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