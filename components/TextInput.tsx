'use client'

import React from "react";

const TextInput: React.FC = () => {
  const [input, setInput] = React.useState("");
  console.log("Text : " + input);
  return (
    <input
      type="text"
      value={input}
      onChange={e => setInput(e.target.value)}
    />
  );
};

export default TextInput;
