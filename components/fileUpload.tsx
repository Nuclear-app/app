'use client'

import * as React from "react";
import { Input } from "./ui/input";
import { FileIcon, FileTextIcon, FileAudioIcon, X, Upload } from "lucide-react";
import { ny } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import { SubmitButton } from "./submit-button";
import upload from "@/public/upload.svg";
import Image from "next/image";

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
  'audio/*': ['.mp3', '.wav', '.m4a']
};

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
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // This is important
  const maxSizeInMB = 100;

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: FileState[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxSizeInMB}MB size limit`);
        return;
      }

      // Check file type
      const isValidType = Object.entries(acceptedFileTypes).some(([type, extensions]) => {
        if (type.includes('/*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(`${baseType}/`);
        }
        return file.type === type || extensions.some(ext => file.name.toLowerCase().endsWith(ext));
      });

      if (!isValidType) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }

      // Create preview URL for images
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      newFiles.push({ file, preview });
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }

    // Clear input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeFile = (fileToRemove: FileState) => {
    setFiles(files.filter(f => f !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      const fileState = files.find(f => f.file === file);
      return fileState?.preview ? (
        <img src={fileState.preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
      ) : null;
    }
    if (file.type.startsWith('audio/')) return <FileAudioIcon className="w-8 h-8" />;
    if (file.type === 'application/pdf') return <FileTextIcon className="w-8 h-8" />;
    return <FileIcon className="w-8 h-8" />;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelection(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // Cleanup previews when component unmounts
  React.useEffect(() => {
    return () => {
      files.forEach(fileState => {
        if (fileState.preview) {
          URL.revokeObjectURL(fileState.preview);
        }
      });
    };
  }, []);

  const handleUploadClick = () => {
    setIsUploading(true);
    returnFiles(files);
  };

  return (
    <div className="lg:w-1/2 md:w-full mx-auto border-2 rounded-lg ">
        <div className="text-2xl font-semibold text-primary self-start p-4 pr-1">
          {isUploading ? "Uploading Files..." : "Upload Files"}
        </div>

      <div
        className={ny(
          "relative flex flex-col items-center justify-center w-full p-12 rounded-lg transition-colors min-h-[300px]",
          dragOver ? "border-primary bg-primary/5" : "border-input",
          error ? "border-destructive" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
          multiple={true}
          accept="image/*,application/pdf,audio/*"
        />

        
        <div className="flex flex-col items-center gap-4">
          
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-lg font-semibold text-primary hover:underline"
            >
              <Image src={upload} alt="upload" width={50} height={50} />
            </button>
            <div className="text-sm text-muted-foreground">Supported: PDFs, Docs, Slides, Images, etc</div>
          </div>
          
        </div>
        {files.length > 0 && (
          <div className="space-y-2 w-full rounded-xl p-2">
            {files.map((fileState, index) => (
              <div
                key={`${fileState.file.name}-${index}`}
                className="flex items-center justify-between p-2"
              >
                <div className="bg-muted flex items-center gap-2 p-1 w-full rounded-lg">
                  {getFileIcon(fileState.file)}
                  <div className="flex flex-row p-2 w-full">
                    <span className="text-xl font-medium truncate w-1/2">
                      {fileState.file.name}
                    </span>
                    <span className="text-sm text-muted-foreground  font-medium truncate w-full pt-1 px-5">
                      {(fileState.file.size / (1024 * 1024)).toFixed(2)}MB
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(fileState)}
                  className="p-1 hover:bg-accent rounded-md"
                  aria-label={`Remove ${fileState.file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-destructive">
          {error}
        </div>
      )}


      <div className="flex justify-center mt-6 w-full">
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
};

export default FileUpload;

