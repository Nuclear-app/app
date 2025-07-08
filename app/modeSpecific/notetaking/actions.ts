import { getBlockNote } from "@/lib/block";


// Is this even used? -Karman


export async function getNoteContent(blockId: string) {
  if (!blockId) {
    throw new Error("Block ID is required");
  }

  const block = await getBlockNote(blockId);

  if (!block) {
    throw new Error("Block not found");
  }

  // Return empty editor state if no note exists
  if (!block.note) {
    return JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    });
  }

  return block.note;
} 