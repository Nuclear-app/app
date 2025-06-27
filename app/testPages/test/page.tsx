"use client";

import { BlockViewNav } from "@/components/blockViewNav";
import FAQ from "@/components/faq";
import { FeatureDock } from "@/components/featureDock";
import FileUpload, { FileState } from "@/components/fileUpload";
import { FillInBlank } from "@/components/FITB/fill-in-blanks";
import { Quiz } from "@/components/quiz";
import { useState } from "react";

export default function TestPage() {
  const [files, setFiles] = useState<FileState[]>([]);
  console.log(files);
  
  return (
    <div className="space-y-4">
      <BlockViewNav blockId={"a0f33687-149e-4ef9-ba64-425f6cd16101"} />
      <FeatureDock />
    </div>
  );
}
