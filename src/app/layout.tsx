import type { Metadata } from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'BookedUp — AI Revenue Optimizer',
  description: 'Turn messages into money',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 flex flex-col px-4 py-6 gap-1 fixed h-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-purple-600">BookedUp</h1>
              <p className="text-xs text-gray-500 mt-0.5">AI Revenue Optimizer</p>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLink href="/" label="Dashboard" icon="📊" />
              <NavLink href="/bookings" label="Bookings" icon="📅" />
              <NavLink href="/clients" label="Clients" icon="👥" />
              <NavLink href="/services" label="Services" icon="✨" />
              <NavLink href="/availability" label="Availability" icon="🕐" />
              <NavLink href="/analytics" label="Analytics" icon="📈" />
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors text-sm font-medium"
    >
      <span>{icon}</span>
      {label}
    </a>
  );
}
