import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';
import { generateOtp } from '@/lib/server/guest-auth';
import { sendOtpEmail } from '@/lib/server/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const body = await req.json().catch(() => ({}));
  const { email, name } = body;

  if (!email || !name) {
    return NextResponse.json({ error: 'email and name are required' }, { status: 400 });
  }

  const emailLower = String(email).toLowerCase().trim();
  const nameTrimmed = String(name).trim();

  // Look up business by slug
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Booking page not found' }, { status: 404 });
  }

  // Invalidate any unused OTPs for this email+business
  await supabase
    .from('guest_otps')
    .update({ used: true })
    .eq('email', emailLower)
    .eq('business_id', business.id)
    .eq('used', false);

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: otpErr } = await supabase.from('guest_otps').insert({
    email: emailLower,
    business_id: business.id,
    code,
    expires_at: expiresAt,
  });

  if (otpErr) {
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }

  await sendOtpEmail({
    to: emailLower,
    name: nameTrimmed,
    code,
    businessName: business.name,
  });

  return NextResponse.json({ sent: true });
}
