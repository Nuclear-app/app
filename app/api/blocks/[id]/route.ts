import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export function PATCH() {
  console.log('PATCH');
  return NextResponse.json({ message: 'PATCH' });
}
