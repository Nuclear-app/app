
// @ts-expect-error - pdfjs-dist types are not properly exported
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";


const loadPdf = async (file: File | null): Promise<PDFPageProxy[]> => {
  if (!file) return [];
  const uri = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument({ url: uri }).promise;

  const pages: PDFPageProxy[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    pages.push(page);
  }
  return pages;
};

const renderPageToImage = async (
    page: pdfjsLib.PDFPageProxy,
    scale: number = 3
  ): Promise<string> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
  
    if (!canvas || !context) {
      throw new Error("Canvas or context is null.");
    }
  
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = viewport.width * pixelRatio;
    canvas.height = viewport.height * pixelRatio;
    context.scale(pixelRatio, pixelRatio);
  
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
  
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      enableWebGL: false,
    };
  
    const renderTask = page.render(renderContext);
  
    await renderTask.promise;
  
    return canvas.toDataURL();
  };
  

export const pdfToImg = async (file: File | null): Promise<string[]> => {
  try {
    const pages = await loadPdf(file);
    const images: string[] = [];

    for (const page of pages) {
      const image = await renderPageToImage(page);
      images.push(image);
    }

    return images;
  } catch (error) {
    console.error("PDF error:", error);
    return [];
  }
};
