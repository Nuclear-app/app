'use client'

import { useEffect, useState, Suspense } from 'react'
import { FileState } from "@/components/fileInputComponent/fileUpload";
import FileUpload from "@/components/fileInputComponent/fileUpload";
import { ocr } from "@/lib/ocr";
import { transcribeAudio } from "@/lib/assemblyai";
import { getAudioURL, deleteAudio } from "@/lib/audioURL";
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { updateContext, fetchNotes } from '@/app/modeSpecific/fileInput/actions';
import { generateNotes } from '@/lib/generateNotes';

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
  'audio/*': ['.mp3', '.wav', '.m4a']
};

function FileInputContent() {
  const [context, setContext] = useState('')
  const [mode, setMode] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const blockId = searchParams.get('blockId');

  useEffect(() => {
    // Get the mode from localStorage
    const storedMode = localStorage.getItem('selectedMode');
    if (storedMode) {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => { //check if user is logged in
    const checkAuth = async () => {
      const supabaseClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      if (error || !session) {
        console.error('Auth error:', error)
        router.push('/sign-in')
        return
      }
    }
    checkAuth()
  }, [router])

  const handleFiles = async (files: FileState[]) => {
    console.log(files);
    try {
      // Validate input
      if (!files || !Array.isArray(files)) {
        throw new Error('Invalid files input');
      }

      // Process all files first to get the complete context
      const processedResults = await Promise.all(
        files.map(async (file) => {
          if (!file || !file.file) return '';

          try {
            // Get the file data from FilePond's responseF
            const fileData = file.file;
            if (!fileData || !fileData.name) {
              throw new Error('Invalid file data');
            }

            // The file data is stored in the name property as a JSON string
            console.log(fileData.name);
            const parsedData = JSON.parse(fileData.name);
            if (!parsedData || !parsedData.url) {
              throw new Error('Invalid file data structure');
            }

            const fileUrl = parsedData.url;
            const fileType = fileData.type;

            // Validate file type
            if (!fileType) {
              console.error('No file type provided');
              return '';
            }

            if (fileType.startsWith('image/') || fileType === 'application/pdf') {
              const response = await fetch(fileUrl);
              if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);
              
              const blob = await response.blob();
              if (blob.size === 0) {
                throw new Error('Empty file received');
              }

              const file = new File([blob], 'temp', { type: fileType });
              
              // Ensure blockId is a string before passing to ocr
              const ocrResult = await ocr(file, blockId ?? '');
              return ocrResult?.text || '';
            }

            if (fileType.startsWith('audio/')) {
              if (!fileUrl) {
                throw new Error('No audio URL provided');
              }
              const transcript = await transcribeAudio(fileUrl);
              return transcript || '';
            }

            console.warn(`Unsupported file type: ${fileType}`);
            return '';
          } catch (error) {
            console.error(`Error processing file:`, error);
            return ''; // Return empty string for failed files
          }
        })
      );

      // Filter out empty results and combine
      const newContext = processedResults
        .filter(result => result.trim().length > 0)
        .join('\n\n')
        .trim();

      if (!newContext) {
        throw new Error('No valid content was extracted from the files');
      }

      // Save context to block if blockId is available
      if (blockId) {
        try {
          // Validate blockId
          if (typeof blockId !== 'string' || blockId.trim().length === 0) {
            throw new Error('Invalid block ID');
          }

          // Get existing notes
          const existingNotes = await fetchNotes(blockId);
          
          // Combine existing notes with new context
          const combinedContext = existingNotes 
            ? `${existingNotes}\n\n${newContext}` 
            : newContext;
          
          // Update the block with combined context
          await updateContext({ blockId, context: combinedContext });
          await generateNotes(blockId);
        } catch (error) {
          console.error('Error updating block context:', error);
          throw error; // Re-throw to be caught by outer try-catch
        }
      }
      
      // Validate mode before navigation
      if (!mode) {
        console.warn('No mode specified, defaulting to dashboard view');
      }
      
      // After context is generated and saved, navigate to the appropriate page
      const redirectPath = mode === 'MEDIUM' 
        ? `/modeSpecific/fillInTheBlanks?blockId=${blockId}` 
        : `/dashboard/block/${blockId}`;
      
      if (!redirectPath) {
        throw new Error('Failed to generate redirect path');
      }

      router.push(redirectPath);
      
    } catch (error) {
      console.error('Error handling files:', error);
      // You might want to show an error message to the user here
      // Consider adding a user-facing error state
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <div className="w-1/2 mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Let's start by uploading your files</h2>
        <FileUpload returnFiles={handleFiles} mode={mode} blockId={blockId || ''} newBlock={true} />
        {/*context && (
          <div className="mt-4 p-4 rounded">
            <h3 className="text-lg font-semibold mb-2">Processing Files...</h3>
            <p className="whitespace-pre-wrap" > {context}</p >
          </div >
        )
        */}
      </div >
    </div>
  )
}

export default function FileInputParent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FileInputContent />
    </Suspense>
  )
}
