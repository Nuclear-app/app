"use server"

import prisma from "@/lib/prisma";

export const fetchPoints = async (blockId: string) => {
  const block = await prisma.block.findUnique({
    where: { id: blockId },
    select: { points: true },
  });
  return block?.points ?? 0;

};


