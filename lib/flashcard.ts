import prisma from "@/lib/prisma";

export async function getFlashcardById(flashcardId: string) {
  try {
    const flashcard = await prisma.flashcard.findUnique({
      where: {
        id: flashcardId,
      },
    });
    return flashcard;
  } catch (error) {
    console.error("Error getting flashcard by ID:", error);
    throw new Error("Failed to get flashcard");
  }
}

export async function getFlashcardsByBlock(blockId: string) {
  try {
        const flashcards = await prisma.flashcard.findMany({
      where: {
        blockId: blockId,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return flashcards;
  } catch (error) {
    console.error("Error getting flashcards by block:", error);
    throw new Error("Failed to get flashcards");
  }
}