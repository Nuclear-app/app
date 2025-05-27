// use client would have to be removed ultimately!!
'use client'

import { useEffect, useState } from 'react'

import { FileState } from "@/components/fileUpload";

import FileUpload from "@/components/fileUpload";

import { ocr } from "@/lib/ocr";

import { transcribeAudio } from "@/lib/assemblyai";

import { getAudioURL, deleteAudio } from "@/lib/audioURL";

import { createBrowserClient } from '@supabase/ssr'

import { useRouter, useSearchParams } from 'next/navigation'

import { updateContext, fetchNotes } from './actions';

const acceptedFileTypes = {

  'application/pdf': ['.pdf'],

  'image/*': ['.png', '.jpg', '.jpeg', '.heic'],

  'audio/*': ['.mp3', '.wav', '.m4a']

};

export default function FileInputPage() {
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

    try {

      let newContext = ''

      for (const file of files) {

        if (!file) continue

        let result = ''

        if (file.file.type.startsWith('image/') || file.file.type === 'application/pdf') {

          const ocrResult = await ocr(file.file)

          result = ocrResult?.text || ''

        }

        if (file.file.type.startsWith('audio/')) {

          const transcriptURL = await getAudioURL(file.file)

          const transcript = await transcribeAudio(transcriptURL)

          result = transcript

          await deleteAudio(file.file.name)

        }

        newContext += result

      }

      setContext(prevContext => prevContext + newContext)

      console.log('Final context:', newContext)
      
      // Save context to block if blockId is available
      if (blockId) {
        // Get existing notes
        const existingNotes = await fetchNotes(blockId);
        
        // Combine existing notes with new context
        const combinedContext = existingNotes 
          ? `${existingNotes}\n\n${newContext}` 
          : newContext;
        
        // Update the block with combined context
        await updateContext({ blockId, context: combinedContext });
      }
      
      // After context is generated and saved, navigate to the appropriate page
      const redirectPath = mode === 'campaign' 
        ? `/modeSpecific/fillInTheBlanks?blockId=${blockId}` 
        : `/dashboard/block/${blockId}`;
      router.push(redirectPath);
      
    } catch (error) {

      console.error('Error handling files:', error)

    }

  }

  return (

    <div>

      <FileUpload returnFiles={handleFiles} mode={mode} />

      {context && (

        <div className="mt-4 p-4 bg-gray-100 rounded">

          <h3 className="text-lg font-semibold mb-2">Processing Files...</h3>

          <p className="whitespace-pre-wrap" > {context}</p >

        </div >

      )
      }

    </div >

  )

}