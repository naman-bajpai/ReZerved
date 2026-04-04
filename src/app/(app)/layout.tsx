import { SidebarNav } from '@/components/sidebar-nav';
import { AppShellGate } from '@/components/app-shell-gate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellGate>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 ml-[260px] min-h-screen bg-[linear-gradient(180deg,rgba(250,250,248,1)_0%,rgba(255,247,237,0.74)_52%,rgba(253,242,248,0.55)_100%)]">
          <div className="px-8 py-7 max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>
    </AppShellGate>
  );
}
