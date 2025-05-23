import { NextResponse } from "next/server";
import {
  TextractClient,
  DetectDocumentTextCommand,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand
} from "@aws-sdk/client-textract";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Validate environment variables
if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION environment variable is not set");
}
if (!process.env.UPLOAD_BUCKET) {
  throw new Error("UPLOAD_BUCKET environment variable is not set");
}

const texClient = new TextractClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(request: Request) {
  try {
    const { imageBase64, fileName } = await request.json();
    
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

    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      try {
        const key = `uploads/${Date.now()}-${fileName}`;
        await s3.send(new PutObjectCommand({
          Bucket: process.env.UPLOAD_BUCKET!,
          Key: key,
          Body: Buffer.from(imageBase64, "base64"),
          ContentType: "application/pdf",
        }));

        const { JobId } = await texClient.send(new StartDocumentTextDetectionCommand({
          DocumentLocation: { S3Object: { Bucket: process.env.UPLOAD_BUCKET!, Name: key } }
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

        const text = allBlocks
          .filter(b => b.BlockType === "LINE")
          .map(b => b.Text)
          .join("\n");
        return NextResponse.json({ text });
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

        const text = Blocks.filter(b => b.BlockType === "LINE").map(b => b.Text).join("\n") || "";
        return NextResponse.json({ text });
      } catch (error: any) {
        console.error("Image processing error:", error);
        return NextResponse.json(
          { error: `Image processing failed: ${error.message}` },
          { status: 500 }
        );
      }
    }
  } catch (error: any) {
    console.error("General error:", error);
    return NextResponse.json(
      { error: `Request processing failed: ${error.message}` },
      { status: 500 }
    );
  }
}
