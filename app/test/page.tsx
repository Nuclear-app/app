"use client";

import { FillInBlank } from "@/components/fill-in-blank";

export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Fill in the Blanks Test</h1>
      
      <div className="space-y-6">
        <FillInBlank
          sentence="The process of photosynthesis converts sunlight into _____ energy. "
          answer="chemical"
          hint="This type of energy is stored in chemical bonds of glucose "
          className="text-lg"
        />

        <FillInBlank 
          sentence="The _____ is the powerhouse of the cell. "
          answer="mitochondria"
          hint="This organelle produces most of the cell's ATP"
          className="text-lg"
        />

        <FillInBlank
          sentence="Water molecules are made up of two hydrogen atoms and one _____ atom. "
          answer="oxygen"
          hint="This element is essential for breathing"
          className="text-lg"
        />
      </div>
    </div>
  );
}
