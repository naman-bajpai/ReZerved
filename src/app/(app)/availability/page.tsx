'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AvailabilityPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-display)]">Availability</h2>
        <p className="text-sm text-muted-foreground mt-1">Set your working hours and booking windows.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-orange-100/80 bg-white/88 shadow-[0_18px_44px_-32px_rgba(236,72,153,0.16)]">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(236,72,153,0.14),rgba(124,58,237,0.14))] ring-1 ring-rose-100/80">
                <Clock className="w-5 h-5 text-rose-500" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-semibold text-foreground">Coming Soon</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                Availability management will be available here. Set your weekly schedule, block off dates, and manage booking windows.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
