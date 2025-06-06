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

interface FileUploadProps {
  returnFiles: (files: FileState[]) => void
  mode: string
}

export interface FileState {
  file: File;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ returnFiles, mode }) => {
  const [files, setFiles] = useState<FileState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
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
      const pond = FilePond.create(pondRef.current, {
        allowMultiple: true,
        maxFiles: 10,
        maxFileSize: '100MB',
        acceptedFileTypes: ['image/*', 'application/pdf', 'audio/*'],
        labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
        server: {
          // This is just for the visual feedback, we're not actually uploading
          process: (fieldName, file, metadata, load, error, progress) => {
            // Simulate progress
            let percent = 0;
            const interval = setInterval(() => {
              percent += 10;
              progress(true, percent, 100);
              if (percent === 100) {
                clearInterval(interval);
                load(Date.now().toString());
              }
            }, 100);
          }
        },
        onaddfile: (error, file) => {
          if (error) return;
          const newFile = new File([file.file], file.filename, { type: file.fileType });
          setFiles(prev => [...prev, { file: newFile }]);
        },
        onremovefile: (error, file) => {
          if (error) return;
          setFiles(prev => prev.filter(f => f.file.name !== file.filename));
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
    returnFiles(files);
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

      <div className="flex justify-center mt-6 w-full p-4">
        {files.length > 0 && 
          <SubmitButton 
            className="w-full" 
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? "Processing..." : "Start learning"}
          </SubmitButton>
        }
      </div>
    </div>
  );

  if (!mounted) return null;

  return content;
};

export default FileUpload;

