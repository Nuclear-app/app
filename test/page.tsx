import { FillInBlank } from "@/components/fill-in-blank";

<div className="space-y-6">
  <p className="text-lg leading-relaxed">
    <FillInBlank
      sentence="The process of photosynthesis converts sunlight into _____ energy."
      answer="chemical"
      hint="This type of energy is stored in chemical bonds of glucose"
    />
    {" "}
    <FillInBlank 
      sentence="The _____ is the powerhouse of the cell."
      answer="mitochondria"
      hint="This organelle produces most of the cell's ATP"
    />
    {" "}
    <FillInBlank
      sentence="Water molecules are made up of two hydrogen atoms and one _____ atom."
      answer="oxygen"
      hint="This element is essential for breathing"
    />
    {" "}These are fundamental concepts in biology that help us understand how living organisms function.
  </p>
</div> 