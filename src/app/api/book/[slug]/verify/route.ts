import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/server/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const body = await req.json().catch(() => ({}));
  const { email, name, code } = body;

  if (!email || !name || !code) {
    return NextResponse.json({ error: 'email, name, and code are required' }, { status: 400 });
  }

  const emailLower = String(email).toLowerCase().trim();

  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();

  if (bizErr || !business) {
    return NextResponse.json({ error: 'Booking page not found' }, { status: 404 });
  }

  // Find valid OTP
  const { data: otp, error: otpErr } = await supabase
    .from('guest_otps')
    .select('*')
    .eq('email', emailLower)
    .eq('business_id', business.id)
    .eq('code', String(code).trim())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpErr || !otp) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // Mark OTP as used
  await supabase.from('guest_otps').update({ used: true }).eq('id', otp.id);

  // Upsert guest session (refresh if same email+business already has one)
  const { data: existing } = await supabase
    .from('guest_sessions')
    .select('id, token')
    .eq('email', emailLower)
    .eq('business_id', business.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let token: string;

  if (existing) {
    // Refresh expiry + update name
    const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('guest_sessions')
      .update({ name: String(name).trim(), expires_at: newExpiry })
      .eq('id', existing.id);
    token = existing.token;
  } else {
    const { data: session, error: sessErr } = await supabase
      .from('guest_sessions')
      .insert({
        email: emailLower,
        name: String(name).trim(),
        business_id: business.id,
      })
      .select('token')
      .single();

    if (sessErr || !session) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
    token = session.token;
  }

  return NextResponse.json({ token, email: emailLower, name: String(name).trim() });
}
