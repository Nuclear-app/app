// 'use client'

// import React, { useState, useRef } from 'react';
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.bubble.css';
// import 'react-quill-new/dist/quill.snow.css';
// import { Sub } from '@radix-ui/react-dropdown-menu';
// import { SubmitButton } from '../submit-button';
// import { title } from 'process';

// const Editor: React.FC<EditorProps> = ({ returnHTMLString }) => {
//   const [editorValue, setEditorValue] = useState("");
//   const [titleValue, setTitleValue] = useState("");
//   const bodyRef = useRef<ReactQuill>(null);

//   const toolbarOptions = {
//     container: [
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ 'script': 'sub' }, { 'script': 'super' }],
//       [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }]
//     ]
//   };

//   return (
//     <form>
//       {/* Title Editor */}
//       <div
//         onKeyDownCapture={e => {
//           if (e.code === 'Enter') {
//             e.preventDefault();
//             console.log('Enter pressed');
//             bodyRef.current?.getEditor().focus();
//           }
//         }}>
//         <ReactQuill
//           className='title'
//           theme="bubble"
//           value={titleValue}
//           onChange={setTitleValue}
//           placeholder="Heading"
//           modules={{
//             toolbar: {
//               container: [],
//             },
//           }}
//         />
//       </div>
//       {/*Body Editor */}
//       <div className='relative w-screen h-screen shadow-md'>
//         <ReactQuill
//           ref={bodyRef}
//           className='body'
//           theme="bubble"
//           value={editorValue}
//           onChange={setEditorValue}
//           placeholder="What are you?"
//           modules={toolbarOptions}
//           // modules={modules}
//           // formats={formats}
//           style={{ marginRight: '80px' }}
//         />
//       </div>
//       <div className="flex justify-center mt-4">
//         <SubmitButton formAction={() => {
//           returnHTMLString(titleValue + editorValue);
//         }}>
//           Save
//         </SubmitButton>
//       </div>
//     </form>
//   );
// };

"use client";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// // import { useActionState, useEffect } from "react";
// // import { createProjectAction } from "@/actions/action";
// // import { ActionResponse } from "@/lib/types";
// // import { cn } from "@/lib/utils";
// // import { toast } from "sonner";

// // const initialState: ActionResponse = {
// //   success: false,
// //   message: "",
// // };

// export default function ProjectForm() {
//   // const [state, formAction, isPending] = useActionState(
//   //   createProjectAction,
//   //   initialState
//   // );

//   // useEffect(() => {
//   //   if (state?.message) {
//   //     toast(state.message, {
//   //       icon: state.success ? (
//   //         <CheckCircle2 className="h-4 w-4" />
//   //       ) : (
//   //         <TriangleAlert className="h-4 w-4" />
//   //       ),
//   //     });
//   //   }
//   // }, [state]);
//   return (
//       // <form action={formAction} className="space-y-4" autoComplete="on">
//       <form className="space-y-4" autoComplete="on">
//         <div className="space-y-2">
//           <Label htmlFor="title">Title</Label>
//           <Input
//             placeholder="Project title"
//             id="title"
//             name="title"
//             autoComplete="title"
//             aria-describedby="title-error"
//             required
//             // disabled={isPending}
//             // className={state.errors?.title ? "border-red-500" : ""}
//             className="border-red-500"
//           />
//           {/* {state.errors?.title && (
//             <p id="title-error" className="text-sm text-red-500">
//               {state.errors.title[0]}
//             </p>
//           )} */}
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="summary">Summary</Label>
//           <Textarea
//             placeholder="Give a brief summary"
//             id="summary"
//             name="summary"
//             autoComplete="summary"
//             aria-describedby="summary-error"
//             required
//             minLength={50}
//             maxLength={500}
//             // disabled={isPending}
//             className="border-red-500"
//             // className={cn(
//             //   `resize-none`,
//             //   state.errors?.summary && "border-red-500"
//             // )}
//           />
//           {/* {state.errors?.summary && (
//             <p id="summary-error" className="text-sm text-red-500">
//               {state.errors.summary[0]}
//             </p>
//           )} */}
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="content">Description</Label>
//           <Textarea
//             placeholder="Full description of your project..."
//             id="content"
//             name="content"
//             autoComplete="content"
//             aria-describedby="content"
//             // disabled={isPending}
//             className="resize-none"
//           />
//         </div>

//         <div className="flex justify-end space-x-3">
//           {/* <Button type="button" variant="outline" disabled={isPending}> */}
//           <Button type="button" variant="outline">
//             Cancel
//           </Button>
//           <Button
//             type="submit"
//             className="flex items-center space-x-3"
//             // disabled={isPending}
//           >
//             {/* {isPending && <Loader2 className="size-4 animate-spin" />} */}
//             <Loader2 className="size-4 animate-spin" />
//             Create
//           </Button>
//         </div>
//       </form>
//   );
// }

// "use client";

// import {
//   EditorBubble,
//   EditorBubbleItem, 
//   EditorCommand, 
//   EditorCommandItem, 
//   EditorContent, 
//   EditorRoot
// } from "novel";

// export default function NuclearEditor() {
//   return (
//     <EditorRoot>
//       <EditorBubble>
//         <EditorBubbleItem>Title</EditorBubbleItem>
//         <EditorBubbleItem>Body</EditorBubbleItem>
//       </EditorBubble>
//       <EditorContent initialContent={{ type: 'doc', content: [] }}/>
//     </EditorRoot>
//   );
// };


"use client";

import { useState, useEffect } from "react";
import {
  EditorRoot,
  EditorContent,
  type EditorInstance,
} from "novel";
// import { defaultEditorContent } from "@/lib/content";
// import { defaultExtensions } from "./extensions";

export default function SimpleEditor() {
  const [initialContent, setInitialContent] = useState(null as null | JSON);

  if (!initialContent) return; // or a loader

  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          // extensions={defaultExtensions}
          className="min-h-[300px] w-full border rounded p-4"
          onUpdate={({ editor }: { editor: EditorInstance }) => {
            // persist HTML and JSON if you want
            const content = editor.getJSON();
            console.log("Editor content:", content);
          }}
        />
      </EditorRoot>
    </div>
  );
}