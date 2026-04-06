'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AvailabilityPage() {
  return (
    <div className="space-y-7 pb-12">
      <div>
        <h1
          className="text-[26px] font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-display)', color: '#f4f4f5' }}
        >
          Availability
        </h1>
        <p className="text-[14px] mt-1" style={{ color: 'rgba(244,244,245,0.45)' }}>
          Set your working hours and booking windows.
        </p>
      </div>

      <div>
        <Card className="border-white/[0.08] bg-white/[0.04] shadow-[0_18px_44px_-28px_rgba(0,0,0,0.45)] backdrop-blur-sm">
          <CardContent className="py-16">
            <div className="text-center">
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  background:
                    'linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14),rgba(124,58,237,0.14))',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Clock className="w-5 h-5 text-rose-400" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#f4f4f5' }}>
                Coming Soon
              </p>
              <p className="text-xs mt-2 max-w-xs mx-auto leading-relaxed" style={{ color: 'rgba(244,244,245,0.5)' }}>
                Availability management will be available here. Set your weekly schedule, block off dates, and manage
                booking windows.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
