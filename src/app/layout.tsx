import type { Metadata } from 'next';
import './globals.css';
import { Manrope, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AppProviders } from '@/components/app-providers';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rezerve — AI Revenue Optimizer',
  description: 'Turn every message into a confirmed booking. The AI revenue engine for service businesses.',
  keywords: ['booking', 'AI', 'revenue', 'nail salon', 'lash artist', 'appointment'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(manrope.variable, bricolage.variable, jetbrains.variable, 'dark')}>
      <body className="font-sans bg-background text-foreground antialiased min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
