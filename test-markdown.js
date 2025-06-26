const MarkdownIt = require('markdown-it');
const { markdownToJSONContent } = require('./lib/markdownToJSON.ts');

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

const testMarkdown = `# Pollution

## Overview
- **Pollution** is the introduction of contaminants into the natural environment that cause harm to living beings and ecosystems.
- It can involve any substance (solid, liquid, gas) or forms of energy (radioactivity, heat, sound, light).
- Pollutants may be foreign substances or naturally occurring contaminants.
- Pollution sources are often human activities such as manufacturing, transportation, agriculture, and poor waste management, but natural events like volcanic eruptions and wildfires also contribute.
- Pollution types are commonly classified as:
  - **Point source**: From concentrated, identifiable locations (e.g., factories, mines).
  - **Nonpoint source**: From diffuse, widely spread sources (e.g., agricultural runoff, microplastics).

## Major Types of Pollution

### 1. Air Pollution
- Release of chemicals and particulates into the atmosphere.
- Common pollutants: carbon monoxide, sulfur dioxide, nitrogen oxides, chlorofluorocarbons (CFCs), particulate matter (PM10, PM2.5).
- Sources include vehicle emissions, industrial processes, burning fossil fuels.
- Effects: respiratory and cardiovascular diseases, acid rain, climate change.

`;

// Debug: Show the tokens
const tokens = md.parse(testMarkdown, {});
console.log('Markdown-it tokens:');
tokens.forEach((token, index) => {
  console.log(`${index}: ${token.type} - "${token.content}" - nesting: ${token.nesting}`);
});

console.log('\n---\n');

const result = markdownToJSONContent(testMarkdown);
console.log('Test conversion result:', JSON.stringify(result, null, 2)); 