import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Rezerve API',
    timestamp: new Date().toISOString(),
  });
}
