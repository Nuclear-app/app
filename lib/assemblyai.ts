import { AssemblyAI } from "assemblyai";

if (!process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY) {
  console.log(process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY);
  throw new Error("ASSEMBLYAI_API_KEY is not set in environment variables");
}

const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY,
});

export async function transcribeAudio(audioFile: string): Promise<string> {
  if (!audioFile) {
    throw new Error("Audio URL is required");
  }

  try {

    const params = {
      audio: audioFile,
      speaker_labels: true,
    };
    const transcript = await client.transcripts.transcribe(params);
    if (!transcript.text) {
      throw new Error("No transcription text received");
    }

    return transcript.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio", { cause: error });
  }
}

// // const audioFile = "./local_file.mp3";
// const audioFile = "" //some audio file

// const params = {
//   audio_url: audioFile,
//   //   speech_model: "",
//   // Remove speech_model as it's not needed for basic transcription
// };

// const run = async () => {
//   const transcript = await client.transcripts.transcribe(params);

//   console.log(transcript.text);
// };

// run();

// transcribeAudio("https://assembly.ai/sports_injuries.mp3").then(console.log);
// transcribeAudio("lib/test.mp3").then(console.log);
