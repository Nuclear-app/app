'use client';
import Editor from "@/components/editor-button-comp/editor";
import { Edit } from "lucide-react";
import React from "react";

const NoteTakingPage = () => {
  const returnHTMLString = (htmlString: string) => {
    // TODO: Insert the HTML string into the database usiing prisma 
    console.log(htmlString);
  };
  
  return (
    <div>
      <Editor returnHTMLString={returnHTMLString}/>
    </div>
  )
}
export default NoteTakingPage;