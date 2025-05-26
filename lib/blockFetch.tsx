import prisma from "@/lib/prisma";

export const fetchPoints = async (blockId: string) => {
  // Adjust the model/field names as per your schema
  // Assuming there is a Block model with a 'points' field
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { points: true },
  });
  return block?.points ?? 0;
};