import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const result = await prisma.user.deleteMany({
    where: { purgeAfter: { lte: new Date() } },
  });

  return NextResponse.json({ purgedUsers: result.count });
}
