

import { JSONContent } from "novel";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

/**
 * Converts markdown text to Novel's JSONContent structure using markdown-it
 * @param markdown - The markdown string to convert
 * @returns JSONContent object that Novel can render
 */
export function markdownToJSONContent(markdown: string): JSONContent {
  const tokens = md.parse(markdown, {});
  const content: JSONContent[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "heading_open") {
      const level = parseInt(token.tag.replace("h", ""), 10);
      const inlineToken = tokens[i + 1];
      let headingContent: JSONContent[] = [];
      if (inlineToken && inlineToken.type === "inline") {
        headingContent = parseInlineTokens(inlineToken.children || []);
      }
      content.push({
        type: "heading",
        attrs: { level: Math.min(level, 3) },
        content: headingContent,
      });
      i += 2; // skip inline and heading_close
    } else if (token.type === "paragraph_open") {
      const inlineToken = tokens[i + 1];
      let paragraphContent: JSONContent[] = [];
      if (inlineToken && inlineToken.type === "inline") {
        paragraphContent = parseInlineTokens(inlineToken.children || []);
      }
      if (paragraphContent.length > 0) {
        content.push({
          type: "paragraph",
          content: paragraphContent,
        });
      }
      i += 2; // skip inline and paragraph_close
    } else if (token.type === "bullet_list_open" || token.type === "ordered_list_open") {
      const listType = token.type === "bullet_list_open" ? "bulletList" : "orderedList";
      const listContent: JSONContent[] = [];
      i++;
      while (tokens[i] && tokens[i].type !== (listType === "bulletList" ? "bullet_list_close" : "ordered_list_close")) {
        if (tokens[i].type === "list_item_open") {
          const itemContent: JSONContent[] = [];
          i++;
          while (tokens[i] && tokens[i].type !== "list_item_close") {
            if (tokens[i].type === "paragraph_open") {
              const inlineToken = tokens[i + 1];
              let paragraphContent: JSONContent[] = [];
              if (inlineToken && inlineToken.type === "inline") {
                paragraphContent = parseInlineTokens(inlineToken.children || []);
              }
              if (paragraphContent.length > 0) {
                itemContent.push({
                  type: "paragraph",
                  content: paragraphContent,
                });
              }
              i += 2; // skip inline and paragraph_close
            } else if (tokens[i].type === "bullet_list_open" || tokens[i].type === "ordered_list_open") {
              // Handle nested lists
              const nestedListType = tokens[i].type === "bullet_list_open" ? "bulletList" : "orderedList";
              const nestedListContent: JSONContent[] = [];
              i++;
              while (tokens[i] && tokens[i].type !== (nestedListType === "bulletList" ? "bullet_list_close" : "ordered_list_close")) {
                if (tokens[i].type === "list_item_open") {
                  const nestedItemContent: JSONContent[] = [];
                  i++;
                  while (tokens[i] && tokens[i].type !== "list_item_close") {
                    if (tokens[i].type === "paragraph_open") {
                      const inlineToken = tokens[i + 1];
                      let paragraphContent: JSONContent[] = [];
                      if (inlineToken && inlineToken.type === "inline") {
                        paragraphContent = parseInlineTokens(inlineToken.children || []);
                      }
                      if (paragraphContent.length > 0) {
                        nestedItemContent.push({
                          type: "paragraph",
                          content: paragraphContent,
                        });
                      }
                      i += 2; // skip inline and paragraph_close
                    } else {
                      i++;
                    }
                  }
                  nestedListContent.push({
                    type: "listItem",
                    content: nestedItemContent,
                  });
                }
                i++;
              }
              itemContent.push({
                type: nestedListType,
                content: nestedListContent,
              });
              i++; // skip list_close
            } else {
              i++;
            }
          }
          listContent.push({
            type: "listItem",
            content: itemContent,
          });
        }
        i++;
      }
      content.push({
        type: listType,
        content: listContent,
      });
      i++; // skip list_close
    } else if (token.type === "blockquote_open") {
      const blockquoteContent: JSONContent[] = [];
      i++;
      while (tokens[i] && tokens[i].type !== "blockquote_close") {
        if (tokens[i].type === "paragraph_open") {
          const inlineToken = tokens[i + 1];
          let paragraphContent: JSONContent[] = [];
          if (inlineToken && inlineToken.type === "inline") {
            paragraphContent = parseInlineTokens(inlineToken.children || []);
          }
          if (paragraphContent.length > 0) {
            blockquoteContent.push({
              type: "paragraph",
              content: paragraphContent,
            });
          }
          i += 2; // skip inline and paragraph_close
        } else {
          i++;
        }
      }
      content.push({
        type: "blockquote",
        content: blockquoteContent,
      });
      i++; // skip blockquote_close
    } else {
      i++;
    }
  }

  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph", content: [] }],
  };
}

// Recursively parse inline tokens and build marks stack
function parseInlineTokens(tokens: any[], marks: any[] = []): JSONContent[] {
  const content: JSONContent[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.type === "text" && token.content.trim()) {
      content.push({
        type: "text",
        text: token.content,
        ...(marks.length > 0 ? { marks: [...marks] } : {}),
      });
      i++;
    } else if (token.type === "code_inline") {
      content.push({
        type: "text",
        text: token.content,
        marks: [...marks, { type: "code" }],
      });
      i++;
    } else if (token.type === "strong_open") {
      // Bold
      const closeIndex = findCloseToken(tokens, i, "strong_close");
      const inner = parseInlineTokens(tokens.slice(i + 1, closeIndex), [...marks, { type: "bold" }]);
      content.push(...inner);
      i = closeIndex + 1;
    } else if (token.type === "em_open") {
      // Italic
      const closeIndex = findCloseToken(tokens, i, "em_close");
      const inner = parseInlineTokens(tokens.slice(i + 1, closeIndex), [...marks, { type: "italic" }]);
      content.push(...inner);
      i = closeIndex + 1;
    } else if (token.type === "s_open") {
      // Strikethrough
      const closeIndex = findCloseToken(tokens, i, "s_close");
      const inner = parseInlineTokens(tokens.slice(i + 1, closeIndex), [...marks, { type: "strike" }]);
      content.push(...inner);
      i = closeIndex + 1;
    } else {
      i++;
    }
  }
  return content;
}

function findCloseToken(tokens: any[], start: number, closeType: string): number {
  let level = 0;
  for (let i = start; i < tokens.length; i++) {
    if (tokens[i].type === tokens[start].type) level++;
    if (tokens[i].type === closeType) {
      level--;
      if (level === 0) return i;
    }
  }
  return tokens.length - 1;
}

// Test function to verify conversion works correctly
export function testMarkdownConversion() {
  const testMarkdown = `# Main Topic

## Key Concepts
- **Concept 1**: Brief explanation
- **Concept 2**: Brief explanation with *emphasis*

## Step-by-Step Process
1. First step with details
2. Second step with \`technical term\`
3. Third step with important note

## Important Notes
> This is a key insight or warning that should be highlighted.

Regular paragraph with **bold** and *italic* text.`;

  const result = markdownToJSONContent(testMarkdown);
  console.log('Test conversion result:', JSON.stringify(result, null, 2));
  return result;
} 