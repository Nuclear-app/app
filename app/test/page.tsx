// use client would have to be removed ultimately!!
'use client'
import FileUpload from "@/components/fileUpload";
import { FileState } from "@/components/fileUpload";

const TestPage = () => {

    const handleFiles = (files: FileState[]) => { 

        // if files is empty then display the upload button. 

    
        console.log(files);
      }
  return (
   
    <div>
      <FileUpload returnFiles={handleFiles} />
    </div>
  );
}

export default TestPage;