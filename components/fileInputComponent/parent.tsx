'use client'

import { useEffect, useState, Suspense } from 'react'
import { FileState } from "@/components/fileInputComponent/fileUpload";
import FileUpload from "@/components/fileInputComponent/fileUpload";
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchContext } from '@/app/modeSpecific/fileInput/actions';
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
    console.log('Files uploaded:', files);
    try {
      // Validate input
      if (!files || !Array.isArray(files)) {
        throw new Error('Invalid files input');
      }

      if (!blockId) {
        throw new Error('Block ID is required');
      }

      // Wait a moment for file processing to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get the concatenated text from FileContext for this block
      try {
        // Get existing notes and file contexts
        const existingNotes = await fetchContext(blockId);
        
        if (!existingNotes || existingNotes.trim().length === 0) {
          throw new Error('No content was extracted from the uploaded files');
        }

        console.log('Retrieved content from FileContext:', existingNotes);

        // Generate notes from the extracted content
        await generateNotes(blockId);
        
      } catch (error) {
        console.error('Error retrieving content from FileContext:', error);
        throw error;
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
