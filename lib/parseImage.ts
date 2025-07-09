
import { createWorker } from 'tesseract.js';

export const parseImage = async (image: File | null) => {
    let ocrResult = '';
    let ocrStatus = '';
    if (!image) return;
    const worker = await createWorker('eng', 1, {
        logger: m => console.log(m),
    });

    try {
        const { data: { text } } = await worker.recognize(image);
        ocrResult = text;
        ocrStatus = 'Success';
    } catch (error) {
        console.error('Error reading image:', error);
        ocrStatus = 'Error';
    } finally {
        await worker.terminate();
    }

    return [ocrResult, ocrStatus];
}