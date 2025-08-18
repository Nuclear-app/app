import { NextResponse } from "next/server";
import {
  TextractClient,
  DetectDocumentTextCommand,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand
} from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createFileContext } from "@/lib/filecontext";

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff'];
const SUPPORTED_PDF_TYPE = 'application/pdf';

export async function POST(request: Request) {
  try {
    // Lazy-load and validate environment to avoid build-time failures
    const REGION = process.env.AMAZON_REGION || process.env.AWS_REGION;
    const BUCKET = process.env.UPLOAD_BUCKET;

    if (!REGION) {
      return NextResponse.json(
        { error: "OCR not configured: missing AMAZON_REGION/AWS_REGION" },
        { status: 500 }
      );
    }
    if (!BUCKET) {
      return NextResponse.json(
        { error: "OCR not configured: missing UPLOAD_BUCKET" },
        { status: 500 }
      );
    }

    const texClient = new TextractClient({ region: REGION });
    const s3 = new S3Client({ region: REGION });

    const { imageBase64, fileName, fileType, blockId } = await request.json();
    
    console.log('OCR API - Received filename:', fileName);
    console.log('OCR API - Received blockId:', blockId);
    
    if (!imageBase64) {
      return NextResponse.json(
        { error: "Missing imageBase64 in request body" },
        { status: 400 }
      );
    }
    
    if (!fileName) {
      return NextResponse.json(
        { error: "Missing fileName in request body" },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { error: "Missing fileType in request body" },
        { status: 400 }
      );
    }

    if (!blockId) {
      return NextResponse.json(
        { error: "Missing blockId in request body" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_IMAGE_TYPES.includes(fileType) && fileType !== SUPPORTED_PDF_TYPE) {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Supported types are: ${[...SUPPORTED_IMAGE_TYPES, SUPPORTED_PDF_TYPE].join(', ')}` },
        { status: 400 }
      );
    }

    // Check file size (base64 string length)
    const base64Size = imageBase64.length * 0.75; // approximate size in bytes
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (base64Size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Validate AWS configuration
    if (!process.env.AMAZON_ACCESS_KEY_ID || !process.env.AMAZON_SECRET_ACCESS_KEY) {
      console.error("AWS credentials not configured");
      return NextResponse.json(
        { error: "AWS configuration error" },
        { status: 500 }
      );
    }

    let extractedText = "";

    if (fileType === SUPPORTED_PDF_TYPE) {
      try {
        const key = `uploads/${Date.now()}-${fileName}`;
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET!,
          Key: key,
          Body: Buffer.from(imageBase64, "base64"),
          ContentType: SUPPORTED_PDF_TYPE,
        }));

        const { JobId } = await texClient.send(new StartDocumentTextDetectionCommand({
          DocumentLocation: { S3Object: { Bucket: BUCKET!, Name: key } }
        }));

        if (!JobId) {
          throw new Error("Failed to start text detection job");
        }

        let jobStatus = "IN_PROGRESS";
        let allBlocks: any[] = [];
        let attempts = 0;
        const maxAttempts = 12; // 1 minute maximum wait time

        while (jobStatus === "IN_PROGRESS" && attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, 5000));
          const resp = await texClient.send(new GetDocumentTextDetectionCommand({ JobId }));
          jobStatus = resp.JobStatus!;
          if (resp.Blocks) allBlocks.push(...resp.Blocks);
          attempts++;
        }

        if (jobStatus === "FAILED") {
          throw new Error("Text detection job failed");
        }

        if (jobStatus === "IN_PROGRESS") {
          throw new Error("Text detection job timed out");
        }

        extractedText = allBlocks
          .filter(b => b.BlockType === "LINE")
          .map(b => b.Text)
          .join("\n");
      } catch (error: any) {
        console.error("PDF processing error:", error);
        return NextResponse.json(
          { error: `PDF processing failed: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      try {
        const imageBytes = Buffer.from(imageBase64, "base64");
        const { Blocks } = await texClient.send(new DetectDocumentTextCommand({
          Document: { Bytes: imageBytes }
        }));
        
        if (!Blocks) {
          throw new Error("No text blocks detected in the image");
        }

        extractedText = Blocks.filter(b => b.BlockType === "LINE").map(b => b.Text).join("\n") || "";
      } catch (error: any) {
        console.error("Image processing error:", error);
        return NextResponse.json(
          { error: `Image processing failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // Store the extracted text in FileContext table
    try {
      // Check if file context already exists for this file
      const { getFileContextByFileName } = await import('@/lib/filecontext');
      const existingContext = await getFileContextByFileName(blockId, fileName);
      
      if (existingContext) {
        // Update existing context
        const { updateFileContext } = await import('@/lib/filecontext');
        await updateFileContext(existingContext.id, {
          text: extractedText
        });
        console.log(`Successfully updated OCR text for file ${fileName} in block ${blockId}`);
      } else {
        // Create new context
        await createFileContext({
          fileName: fileName,
          text: extractedText,
          blockId: blockId
        });
        console.log(`Successfully stored OCR text for file ${fileName} in block ${blockId}`);
      }
    } catch (error) {
      console.error("Error storing OCR text in FileContext:", error);
      // Don't fail the entire request if storage fails, just log it
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error("General error:", error);
    return NextResponse.json(
      { error: `Request processing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
