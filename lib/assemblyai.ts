import { AssemblyAI } from "assemblyai";

if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {

  throw new Error("NEXT_PUBLIC_ASSEMBLYAI_API_KEY is not set in environment variables");

}

const client = new AssemblyAI({

  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,

});

export async function transcribeAudio(audioUrl: string, fileName?: string, blockId?: string): Promise<string> {

  if (!audioUrl) {

    throw new Error("Audio URL is required");

  }

  try {

    // If fileName and blockId are provided, use the API endpoint for server-side storage
    if (fileName && blockId) {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          audioUrl: audioUrl,
          fileName: fileName,
          blockId: blockId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Transcription API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Transcription failed: ${errorData.error || response.statusText}`);
      }

      const { text, error } = await response.json();

      if (error) {
        console.error('Transcription processing error:', error);
        throw new Error(error);
      }

      console.log('Transcribed content:', text);
      return text;
    } else {
      // Fallback to direct AssemblyAI call for cases without storage
      const transcript = await client.transcripts.transcribe({
        audio_url: audioUrl,
        speech_model: "nano",
      });
          
      if (!transcript.text) {
        throw new Error("No transcription text received");
      }

      console.log('Transcribed content:', transcript.text);
      return transcript.text;
    }

  } catch (error) {

    console.error("Error transcribing audio:", error);

    throw new Error("Failed to transcribe audio");

  }

}