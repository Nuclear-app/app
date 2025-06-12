import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface UseBlockFilesReturn {
  uploadedFiles: string[]
  fileUrls: { [key: string]: string }
  uploadStatus: string
  handleFileUpload: (filePaths: string[]) => Promise<void>
  refreshFiles: () => Promise<void>
}

const BUCKET_NAME = 'transcription'
const STORAGE_URL = 'https://fltlldpnbbtgrmsgrplo.supabase.co/storage/v1/object/public'

export function useBlockFiles(blockId: string | null): UseBlockFilesReturn {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({})
  const [uploadStatus, setUploadStatus] = useState<string>('')

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const getPublicUrl = (filePath: string) => {
    return `${STORAGE_URL}/${BUCKET_NAME}/${filePath}`
  }

  const fetchExistingFiles = async () => {
    if (!blockId) return

    try {
      const response = await fetch(`/api/blocks/${blockId}/files`)
      const data = await response.json()
      
      if (data.files) {
        setUploadedFiles(data.files)

        // Get signed URLs for each file
        const urls: { [key: string]: string } = {}
        for (const filePath of data.files) {
          // For public files, we can use the public URL directly
          urls[filePath] = getPublicUrl(filePath)
        }
        setFileUrls(urls)
      }
    } catch (error) {
      console.error('Error fetching existing files:', error)
      setUploadStatus('Error fetching existing files')
    }
  }

  // Fetch existing files when blockId changes
  useEffect(() => {
    fetchExistingFiles()
  }, [blockId])

  const handleFileUpload = async (filePaths: string[]) => {
    if (!blockId) return

    try {
      // Update the block with the uploaded file paths
      const response = await fetch(`/api/blocks/${blockId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePaths }),
      })

      if (response.ok) {
        // Update local state with new files
        setUploadedFiles(prev => [...prev, ...filePaths])
        
        // Get public URLs for new files
        const newUrls: { [key: string]: string } = {}
        for (const filePath of filePaths) {
          newUrls[filePath] = getPublicUrl(filePath)
        }
        setFileUrls(prev => ({ ...prev, ...newUrls }))
        setUploadStatus('Files uploaded successfully')
      } else {
        setUploadStatus('Failed to upload files')
      }
    } catch (error) {
      console.error('Error updating block files:', error)
      setUploadStatus('Error uploading files')
    }
  }

  return {
    uploadedFiles,
    fileUrls,
    uploadStatus,
    handleFileUpload,
    refreshFiles: fetchExistingFiles
  }
} 