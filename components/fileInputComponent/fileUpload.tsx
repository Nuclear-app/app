'use client'

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitButton } from "../submit-button";
import * as FilePond from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import { createPortal } from 'react-dom';
import { createBrowserClient } from '@supabase/ssr';
import { addFile, removeFile } from '@/lib/fileUpload';
import SparklesText from "../ui/sparkles-text";
import { FunFacts } from "../ui/fun-facts";

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { TextAnimate } from "../ui/text-animate";
import { transcribeAudio } from "@/lib/assemblyai";
import { ocr } from "@/lib/ocr";

// Custom FilePond styles
const filePondStyles = `
  .filepond--drop-label {
    color: #eeeeee;
  }

  .filepond--label-action {
    text-decoration-color: #eeeeee;
  }

  .filepond--panel-root {
    background-color: #221D1D;
    border-radius: 0.5em;
  }
`;

// Register plugins
FilePond.registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize,
  FilePondPluginFileEncode
);

// Initialize Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


interface FileUploadProps {
  returnFiles: (files: FileState[]) => void
  mode: string
  blockId: string
  newBlock: boolean
}

export interface FileState {
  file: File;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ returnFiles, mode, blockId, newBlock }) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileState[]>([]);
  const pondRef = useRef<HTMLInputElement>(null);
  const pondInstanceRef = useRef<FilePond.FilePond | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getFileContent = async (file: FileState) => {
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
  }

  useEffect(() => {
    if (!mounted) return;

    // Cleanup previous instance if it exists
    if (pondInstanceRef.current) {
      pondInstanceRef.current.destroy();
    }

    // Only initialize if the ref exists
    if (pondRef.current) {
      console.log('Creating FilePond instance');
      const pond = FilePond.create(pondRef.current, {
        allowMultiple: true,
        maxFiles: 10,
        acceptedFileTypes: ['image/*', 'application/pdf', 'audio/*'],
        labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
        instantUpload: true,
        server: {
          process: async (fieldName, file, metadata, load, error, progress) => {
            console.log('Processing file:', file);
            try {
              // Check if user is authenticated
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();

              if (sessionError) {
                console.error('Session error:', sessionError);
                error('Authentication error. Please try signing in again.');
                return;
              }

              if (!session) {
                console.log('User not authenticated');
                error('You must be logged in to upload files');
                return;
              }

              // Generate a unique file path with user ID
              const fileExt = file.name.split('.').pop();
              const fileName = `${session.user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
              const filePath = fileName;

              // Upload to Supabase Storage
              const { data, error: uploadError } = await supabase.storage
                .from('files')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (uploadError) {
                console.error('Upload error details:', {
                  error: uploadError,
                  bucket: 'files',
                  filePath,
                  fileName: file.name
                });
                if (uploadError.message.includes('violates row-level security policy')) {
                  error('Permission denied. Please check your storage policies.');
                } else if (uploadError.message.includes('Bucket not found')) {
                  error('Storage bucket not found. Please check your Supabase configuration.');
                } else {
                  error(uploadError.message);
                }
                return;
              }

              // Get the public URL
              const { data: { publicUrl } } = supabase.storage
                .from('files')
                .getPublicUrl(filePath);

              console.log('File uploaded successfully:', {
                filePath,
                publicUrl,
                bucket: 'files'
              });

              // Store the file path in the file object
              const fileData = {
                url: publicUrl,
                path: filePath
              };
              console.log('Upload response:', fileData);

              // Create a temporary FileState object to pass to getFileContent
              const tempFileState: FileState = {
                file: new File([file], JSON.stringify(fileData), { type: file.type })
              };

              // Extract and print the file content - this must complete before loading finishes
              console.log('Extracting content from file:', file.name);
              const extractedContent = await getFileContent(tempFileState);
              console.log('Extracted content:', extractedContent);

              // Only complete the upload if content extraction was successful
              if (extractedContent !== '') {
                console.log('Content extraction successful, completing upload');
                // Pass the file data as a string
                load(JSON.stringify(fileData));
              } else {
                console.error('Content extraction failed for file:', file.name);
                error('Failed to extract content from file. Please try again.');
              }
            } catch (err) {
              console.error('Upload error:', err);
              error('Upload failed. Please try again.');
            }
          },
          revert: async (uniqueFileId, load, error) => {
            console.log('Revert called with:', uniqueFileId);
            try {
              // Parse the file data from uniqueFileId
              const fileData = JSON.parse(uniqueFileId);
              console.log('Parsed file data:', fileData);

              if (!fileData || !fileData.path) {
                console.error('No file path found in uniqueFileId');
                error('Could not find file path');
                return;
              }

              // Check if user is authenticated
              const { data: { session }, error: sessionError } = await supabase.auth.getSession();

              if (sessionError) {
                console.error('Session error:', sessionError);
                error('Authentication error. Please try signing in again.');
                return;
              }

              if (!session) {
                console.log('User not authenticated');
                error('You must be logged in to delete files');
                return;
              }

              // Delete from Supabase Storage
              const { error: deleteError } = await supabase.storage
                .from('files')
                .remove([fileData.path]);

              if (deleteError) {
                console.error('Delete error:', deleteError);
                if (deleteError.message.includes('violates row-level security policy')) {
                  error('Permission denied. Please check your storage policies.');
                } else {
                  error(deleteError.message);
                }
                return;
              }

              // Remove file name from Block's files array
              try {
                await removeFile(blockId, fileData.path.split('/').pop()!);
                console.log('Removed file from Block:', fileData.path);
              } catch (err) {
                console.error('Error updating Block files:', err);
              }

              console.log('File deleted successfully from storage');
              load();
            } catch (err) {
              console.error('Delete error:', err);
              error('Delete failed. Please try again.');
            }
          }
        },
        onaddfile: async (error, file) => {
          if (error) return;
          
          // Store the original filename - this is the filename from the user's computer
          const originalFilename = file.filename;
          console.log('Original filename captured:', originalFilename);
          
          // Create a new file with the server response data
          const newFile = new File([file.file], JSON.stringify({
            url: null, // Will be set after upload
            path: null, // Will be set after upload
            originalName: originalFilename // Store the original filename in the JSON data
          }), { type: file.fileType });
          setFiles(prev => [...prev, { file: newFile }]);

          // Add file name to Block's files array - use the original filename
          try {
            await addFile(blockId, originalFilename);
            console.log('Added file to Block:', originalFilename);
          } catch (err) {
            console.error('Error updating Block files:', err);
          }

        },
        onprocessfile: (error, file) => {
          if (error) return;
          
          // Get the original filename from the file object
          const originalFilename = file.filename;
          console.log('Processing file with original name:', originalFilename);
          
          // Parse the server response to get URL and path
          const serverData = file.serverId ? JSON.parse(file.serverId) : {};
          
          // When file is fully processed (uploaded), add it to uploadedFiles
          const processedFile = new File([file.file], JSON.stringify({
            url: serverData.url || null,
            path: serverData.path || null,
            originalName: originalFilename // Store the original filename
          }), { type: file.fileType });
          setUploadedFiles(prev => [...prev, { file: processedFile }]);
        },
        onremovefile: (error, file) => {
          if (error) return;
          setFiles(prev => prev.filter(f => f.file.name !== file.filename));
          setUploadedFiles(prev => prev.filter(f => f.file.name !== file.filename));
        }
      });

      pondInstanceRef.current = pond;
    }

    return () => {
      if (pondInstanceRef.current) {
        pondInstanceRef.current.destroy();
        pondInstanceRef.current = null;
      }
    };
  }, [mounted]);

  const handleUploadClick = () => {
    setIsUploading(true);
    // Only return files that have been fully uploaded
    returnFiles(uploadedFiles);
  };

  const content = (
    <div className="lg:w-full md:w-full mx-auto border-2 rounded-lg">
      <style>{filePondStyles}</style>
      {/* <div className="text-2xl font-semibold text-primary self-start p-4 pr-1">
        {isUploading ? "Uploading Files..." : "Upload Files"}
      </div> */}

      <div className="p-4">
        <input
          type="file"
          ref={pondRef}
          className="filepond"
        />
      </div>

      <div className="flex justify-center w-full p-4 text-center">
        {files.length > 0 && newBlock && (
          isUploading ? (
            <div className="space-y-4">
              <SparklesText text="We're getting your notes ready..." />
              <FunFacts />
            </div>
          ) : (
            <SubmitButton
              className="w-full"
              onClick={handleUploadClick}
              disabled={uploadedFiles.length === 0}
            >
              {uploadedFiles.length === 0 ? "Uploading..." : "Start learning"}
            </SubmitButton>
          )
        )}
      </div>
    </div>
  );

  if (!mounted) return null;

  return content;
};

export default FileUpload;

