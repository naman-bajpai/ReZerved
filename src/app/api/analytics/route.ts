import { NextRequest, NextResponse } from 'next/server';
import { withBusiness } from '@/lib/server/auth';
import supabase from '@/lib/server/supabase';

export const GET = withBusiness(async (req, _profile, business) => {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || '30d';
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [revenueRes, bookingStatsRes, topClientsRes, slotPatternRes, upcomingRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('total_price, status')
        .eq('business_id', business.business_id)
        .in('status', ['confirmed', 'no_show'])
        .gte('starts_at', since),
      supabase
        .from('bookings')
        .select('status')
        .eq('business_id', business.business_id)
        .gte('created_at', since),
      supabase
        .from('clients')
        .select('id, name, avg_spend, last_booked_at, typical_frequency_days')
        .eq('business_id', business.business_id)
        .order('avg_spend', { ascending: false })
        .limit(10),
      supabase
        .from('bookings')
        .select('starts_at, status')
        .eq('business_id', business.business_id)
        .in('status', ['confirmed', 'no_show'])
        .gte('starts_at', since),
      supabase
        .from('bookings')
        .select('starts_at, total_price, clients (name), services (name)')
        .eq('business_id', business.business_id)
        .eq('status', 'confirmed')
        .gte('starts_at', new Date().toISOString())
        .lte('starts_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('starts_at'),
    ]);

    const confirmedBookings = revenueRes.data || [];
    const totalRevenue = confirmedBookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);
    const avgRevenuePerBooking = confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0;

    const statusCounts: Record<string, number> = {};
    (bookingStatsRes.data || []).forEach((b: any) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayCount = new Array(7).fill(0);
    (slotPatternRes.data || []).forEach((b: any) => {
      const dow = new Date(b.starts_at).getDay();
      dayCount[dow]++;
    });
    const busiestDays = dayCount
      .map((count, i) => ({ day: dayNames[i], count }))
      .sort((a, b) => b.count - a.count);

    const totalCompleted = (statusCounts.confirmed || 0) + (statusCounts.no_show || 0);
    const noShowRate = totalCompleted > 0
      ? (((statusCounts.no_show || 0) / totalCompleted) * 100).toFixed(1)
      : '0.0';

    return NextResponse.json({
      period: `${days} days`,
      revenue: {
        total: totalRevenue.toFixed(2),
        avgPerBooking: avgRevenuePerBooking.toFixed(2),
        confirmedCount: confirmedBookings.length,
      },
      bookings: {
        breakdown: statusCounts,
        noShowRate: `${noShowRate}%`,
        total: (bookingStatsRes.data || []).length,
      },
      busiestDays,
      topClients: topClientsRes.data || [],
      upcoming: upcomingRes.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
});
