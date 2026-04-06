import type { Metadata } from 'next';
import './globals.css';
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppProviders } from '@/components/app-providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BookedUp — AI Revenue Optimizer',
  description: 'Turn every message into a confirmed booking. The AI revenue engine for service businesses.',
  keywords: ['booking', 'AI', 'revenue', 'nail salon', 'lash artist', 'appointment'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(jakarta.variable, fraunces.variable, jetbrains.variable, 'dark')}>
      <body className="font-sans bg-background text-foreground antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
