// use client would have to be removed ultimately!!
'use client'
import { FileState } from "@/components/fileUpload";
import FileUpload from "@/components/fileUpload";
import { ocr } from "@/lib/ocr";
import { transcribeAudio } from "@/lib/assemblyai";

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'image/*': ['.png', '.jpg', '.jpeg', '.heic'],
  'audio/*': ['.mp3', '.wav', '.m4a']
};

export default function FileInputPage() {
  let context = ''

  const handleFiles = (files: FileState[]) => {
    files.forEach(async file => {
      // console.log(file.file.webkitRelativePath);
      // console.log(file.file);
      if (!file) return;
      let result = '';
      context += result;
      if (file.file.type.startsWith('image/') || file.file.type === 'application/pdf') {
        let ocrResult = await ocr(file.file);
        result = ocrResult?.text || '';
      }
      // if (file.file.type.startsWith('audio/')){
      //   console.log(file.file.name);
      //   let transcript = await transcribeAudio(file.file.name);
      //   console.log(file.file.webkitRelativePath);
      //   result = transcript;
      //   console.log(result);
      // }
    });
  }

  console.log(context);

  return (

    <div>
      <FileUpload returnFiles={handleFiles} />
    </div>
  );
}