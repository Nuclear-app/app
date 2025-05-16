'use client';
import NuclearEditor from "@/components/editor-button-comp/nuclear-editor";
import { Edit } from "lucide-react";
import React from "react";

const NoteTakingPage = () => {
  const returnHTMLString = (htmlString: string) => {
    // TODO: Insert the HTML string into the database usiing prisma 
    console.log(htmlString);
  };
  
  return (
    <div>
      <NuclearEditor />
    </div>
  )
}
export default NoteTakingPage;