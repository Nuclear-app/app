// pages/api/ocr.ts
import { NextApiRequest, NextApiResponse } from "next";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const client = new TextractClient({
  region: process.env.AWS_REGION, 
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request body" });
    }

    const imageBytes = Buffer.from(imageBase64, "base64");
    const command = new DetectDocumentTextCommand({
      Document: { Bytes: imageBytes },
    });
    const { Blocks } = await client.send(command);

    const textLines = Blocks
      ?.filter((b) => b.BlockType === "LINE")
      .map((b) => b.Text)
      .join("\n") || "";

    res.status(200).json({ text: textLines });
  } catch (err: any) {
    console.error("Textract error:", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
}
