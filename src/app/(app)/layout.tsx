import { SidebarNav } from '@/components/sidebar-nav';
import { AppShellGate } from '@/components/app-shell-gate';
import { PageTransition } from '@/components/page-transition';
import { DashboardAI } from '@/components/dashboard-ai';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellGate>
      <div className="flex min-h-screen" style={{ background: '#09090b' }}>
        <SidebarNav />
        <main
          className="flex-1 min-h-screen"
          style={{
            marginLeft: '256px',
            background: '#09090b',
          }}
        >
          <div className="relative px-8 py-7 max-w-[1320px]">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <DashboardAI />
    </AppShellGate>
  );
}
