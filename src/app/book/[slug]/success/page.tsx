'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, ArrowLeft } from 'lucide-react';

export default function SuccessPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>

        <h1 className="text-2xl font-bold text-[#0f0a1e] mb-2">You're booked!</h1>
        <p className="text-sm text-gray-500 mb-8">
          Your appointment has been confirmed and payment received. Check your email for a receipt.
        </p>

        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-6 flex items-center gap-3 text-left">
          <Calendar className="w-5 h-5 text-[#f97316] flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 font-medium">Confirmation ID</p>
            <p className="text-sm font-mono font-semibold text-[#0f0a1e]">
              {bookingId?.slice(0, 8).toUpperCase() || '—'}
            </p>
          </div>
        </div>

        <Link
          href={`/book/${params.slug}`}
          className="flex items-center justify-center gap-2 text-sm text-[#f97316] font-medium hover:text-[#ea6c0a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to booking page
        </Link>
      </div>
    </div>
  );
}
