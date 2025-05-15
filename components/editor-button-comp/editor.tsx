'use client'

import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import 'react-quill-new/dist/quill.snow.css';
import './styles.css';
import { Sub } from '@radix-ui/react-dropdown-menu';
import { SubmitButton } from '../submit-button';

interface EditorProps {
  returnHTMLString: (htmlString: string) => void;
}

// export default function Editor() {
//   const toolbarOptions = ['bold', 'italic', 'underline', 'strike', { list: 'ordered' }, { list: 'bullet' }, { align: [] }, { color: [] }, { background: [] }, 'link', 'image', 'clean'];
//   // const quill = new Quill('#editor', {
//   //   modules: {
//   //     toolbar: toolbarOptions
//   //   }
//   // });
//   const [value, setValue] = useState('');
//   return (
//     // <div className='border-2 border-gray-300 rounded-lg p-4'>
//     <div>
//       <ReactQuill
//         theme="snow"
//         value={value}
//         onChange={setValue}
//         placeholder="What do you want with life?"
//       />
//     </div>
//   )
// }

// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css'; // Import the Snow theme CSS

const Editor: React.FC<EditorProps> = ({ returnHTMLString }) => {
  const [editorValue, setEditorValue] = useState("<h1>Untitled Page</h1><p></p>");
  return (
    <form>
      <div>
        <ReactQuill
          theme="snow"
          value={editorValue}
          onChange={setEditorValue}
          placeholder="What do you want with life?"
        />
      </div>
      <div className="flex justify-center mt-4">
        <SubmitButton formAction={() => {
          returnHTMLString(editorValue);
          setEditorValue("<h1>Untitled Page</h1><p></p>");
        }}>
          Submit
        </SubmitButton>
      </div>
    </form>
  );
};

export default Editor;