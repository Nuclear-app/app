import { AssemblyAI } from "assemblyai";

if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {

  throw new Error("NEXT_PUBLIC_ASSEMBLYAI_API_KEY is not set in environment variables");

}

const client = new AssemblyAI({

  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,

});

export async function transcribeAudio(audioUrl: string): Promise<string> {

  if (!audioUrl) {

    throw new Error("Audio URL is required");

  }

  try {

    const transcript = await client.transcripts.transcribe({

      audio_url: audioUrl,

      speech_model: "nano",

    });
        
    if (!transcript.text) {

      throw new Error("No transcription text received");

    }

    return transcript.text;

  } catch (error) {

    console.error("Error transcribing audio:", error);

    throw new Error("Failed to transcribe audio");

  }

}