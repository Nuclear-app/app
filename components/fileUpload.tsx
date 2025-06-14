'use client'

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SubmitButton } from "./submit-button";
import * as FilePond from 'filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import { createPortal } from 'react-dom';
import { createBrowserClient } from '@supabase/ssr';
import prisma from '@/lib/prisma';
import { addFile, removeFile } from '@/lib/fileUpload';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

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
        maxFileSize: '100MB',
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
              
              // Pass the file data as a string
              load(JSON.stringify(fileData));
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
          // Create a new file with the server response data
          const newFile = new File([file.file], JSON.stringify({
            url: file.serverId ? JSON.parse(file.serverId).url : null,
            path: file.serverId ? JSON.parse(file.serverId).path : null
          }), { type: file.fileType });
          setFiles(prev => [...prev, { file: newFile }]);

          // Add file name to Block's files array
          try {
            await addFile(blockId, file.filename);
            console.log('Added file to Block:', file.filename);
          } catch (err) {
            console.error('Error updating Block files:', err);
          }
        },
        onprocessfile: (error, file) => {
          if (error) return;
          // When file is fully processed (uploaded), add it to uploadedFiles
          const processedFile = new File([file.file], JSON.stringify({
            url: file.serverId ? JSON.parse(file.serverId).url : null,
            path: file.serverId ? JSON.parse(file.serverId).path : null
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

      <div className="flex justify-center w-full">
        {files.length > 0 && newBlock && 
          <SubmitButton 
            className="w-full" 
            onClick={handleUploadClick}
            disabled={isUploading || uploadedFiles.length === 0}
          >
            {isUploading ? "Processing..." : uploadedFiles.length === 0 ? "Uploading..." : "Start learning"}
          </SubmitButton>
        }
      </div>
    </div>
  );

  if (!mounted) return null;

  return content;
};

export default FileUpload;

