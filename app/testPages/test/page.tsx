"use client";

import FAQ from "@/components/faq";
import FileUpload, { FileState } from "@/components/fileUpload";
import { FillInBlank } from "@/components/fill-in-blank";
import { Quiz } from "@/components/quiz";
import { useState } from "react";

export default function TestPage() {
  const [files, setFiles] = useState<FileState[]>([]);
  console.log(files);
  
  return (
    <div className="space-y-4">
      <FileUpload mode={"test"} returnFiles={setFiles} />
      
      {files.length > 0 && (
        <div className="lg:w-1/2 md:w-full mx-auto border-2 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Selected Files:</h2>
          <ul className="list-disc list-inside">
            {files.map((file, index) => (
              <li key={index} className="text-gray-700">
                {file.file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
