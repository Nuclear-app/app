'use client'

import { useState, useEffect } from 'react'
import FileUpload, { FileState } from '@/components/fileUpload'
import { useSearchParams } from 'next/navigation'
import { updateBlockFiles, getBlockFiles } from '@/lib/blockFetch'
import { createBrowserClient } from '@supabase/ssr'


export default function TestUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<FileState[]>([])
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [existingFiles, setExistingFiles] = useState<string[]>([])
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({})
  const searchParams = useSearchParams()
  const blockId = searchParams.get('blockId')

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch existing files when blockId changes
  useEffect(() => {
    const fetchExistingFiles = async () => {
      if (!blockId) return

      try {
        const files = await getBlockFiles(blockId)
        setExistingFiles(files)

        // Get signed URLs for each file
        const urls: { [key: string]: string } = {}
        for (const filePath of files) {
          const { data } = await supabase
            .storage
            .from('transcription')
            .createSignedUrl(filePath, 3600) // 1 hour expiry
          
          if (data?.signedUrl) {
            urls[filePath] = data.signedUrl
          }
        }
        setFileUrls(urls)
      } catch (error) {
        console.error('Error fetching existing files:', error)
        setUploadStatus('Error fetching existing files')
      }
    }

    fetchExistingFiles()
  }, [blockId, supabase])

  const handleFiles = async (files: FileState[]) => {
    setUploadStatus('Processing files...')
    console.log('Received files:', files)
    
    // Log each file's details
    files.forEach(file => {
      console.log('File:', {
        name: file.file.name,
        type: file.file.type,
        size: file.file.size,
        uploadedPath: file.uploadedPath
      })
    })

    // Update the block with the uploaded file paths
    if (blockId) {
      try {
        const filePaths = files.map(file => file.uploadedPath).filter(Boolean) as string[]
        await updateBlockFiles(blockId, filePaths)
        setUploadStatus('Files processed and block updated successfully!')
        
        // Update existing files list
        setExistingFiles(prev => [...prev, ...filePaths])
        
        // Get signed URLs for new files
        const newUrls: { [key: string]: string } = {}
        for (const filePath of filePaths) {
          const { data } = await supabase
            .storage
            .from('transcription')
            .createSignedUrl(filePath, 3600)
          
          if (data?.signedUrl) {
            newUrls[filePath] = data.signedUrl
          }
        }
        setFileUrls(prev => ({ ...prev, ...newUrls }))
      } catch (error) {
        console.error('Error updating block:', error)
        setUploadStatus('Files uploaded but failed to update block.')
      }
    } else {
      setUploadStatus('Files processed successfully! (No block ID provided)')
    }

    setUploadedFiles(files)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">File Upload Test</h1>
      {blockId && <p className="mb-4">Block ID: {blockId}</p>}
      
      <div className="mb-8">
        <FileUpload returnFiles={handleFiles} mode="test" />
      </div>

      {uploadStatus && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <p className="text-lg">{uploadStatus}</p>
        </div>
      )}

      {existingFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">File History:</h2>
          <div className="space-y-4">
            {existingFiles.map((filePath, index) => (
              <div key={index} className="p-4 border rounded">
                <p><strong>File Path:</strong> {filePath}</p>
                {fileUrls[filePath] && (
                  <div className="mt-2">
                    <a 
                      href={fileUrls[filePath]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Newly Uploaded Files:</h2>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="p-4 border rounded">
                <p><strong>Name:</strong> {file.file.name}</p>
                <p><strong>Type:</strong> {file.file.type}</p>
                <p><strong>Size:</strong> {(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Uploaded Path:</strong> {file.uploadedPath}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 