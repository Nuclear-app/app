import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";
import { createFileContext } from "@/lib/filecontext";

// Validate environment variables
if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {
  throw new Error("NEXT_PUBLIC_ASSEMBLYAI_API_KEY is not set");
}

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { audioUrl, fileName, blockId } = await request.json();
    
    console.log('Transcribe API - Received filename:', fileName);
    console.log('Transcribe API - Received blockId:', blockId);
    
    if (!audioUrl) {
      return NextResponse.json(
        { error: "Missing audioUrl in request body" },
        { status: 400 }
      );
    }
    
    if (!fileName) {
      return NextResponse.json(
        { error: "Missing fileName in request body" },
        { status: 400 }
      );
    }

    if (!blockId) {
      return NextResponse.json(
        { error: "Missing blockId in request body" },
        { status: 400 }
      );
    }

    // Check file size (audioUrl length as approximate size)
    const audioUrlSize = audioUrl.length * 0.75; // approximate size in bytes
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (audioUrlSize > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Transcribe audio using AssemblyAI
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      speech_model: "nano",
    });
        
    if (!transcript.text) {
      return NextResponse.json(
        { error: "No transcription text received" },
        { status: 500 }
      );
    }

    // Store the transcribed text in FileContext table
    try {
      // Check if file context already exists for this file
      const { getFileContextByFileName } = await import('@/lib/filecontext');
      const existingContext = await getFileContextByFileName(blockId, fileName);
      
      if (existingContext) {
        // Update existing context
        const { updateFileContext } = await import('@/lib/filecontext');
        await updateFileContext(existingContext.id, {
          text: transcript.text
        });
        console.log(`Successfully updated transcription for file ${fileName} in block ${blockId}`);
      } else {
        // Create new context
        await createFileContext({
          fileName: fileName,
          text: transcript.text,
          blockId: blockId
        });
        console.log(`Successfully stored transcription for file ${fileName} in block ${blockId}`);
      }
      console.log('Transcribed content:', transcript.text);
    } catch (error) {
      console.error("Error storing transcription in FileContext:", error);
      // Don't fail the entire request if storage fails, just log it
    }

    return NextResponse.json({ text: transcript.text });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: `Transcription failed: ${error.message}` },
      { status: 500 }
    );
  }
} 