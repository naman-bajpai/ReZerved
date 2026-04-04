import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import { enqueueSlotFiller } from '@/lib/server/queue';

export const POST = withBusiness(async (req, _profile, business) => {
  const body = await req.json().catch(() => ({}));
  const { starts_at } = body;

  if (!starts_at) {
    return NextResponse.json({ error: 'starts_at required' }, { status: 400 });
  }

  await enqueueSlotFiller(business.business_id, null, starts_at, null);

  return NextResponse.json({ success: true, message: 'Slot filler triggered' });
});
