import { SidebarNav } from '@/components/sidebar-nav';
import { AppShellGate } from '@/components/app-shell-gate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellGate>
      <div className="flex min-h-screen" style={{ background: '#09090b' }}>
        <SidebarNav />
        <main
          className="flex-1 min-h-screen"
          style={{
            marginLeft: '256px',
            background: 'linear-gradient(180deg, #0d0d12 0%, #0a0a0f 100%)',
          }}
        >
          {/* Subtle top glow */}
          <div
            className="fixed top-0 left-[256px] right-0 h-px pointer-events-none z-10"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.08), rgba(251,113,133,0.06), transparent)' }}
          />
          <div className="relative px-8 py-7 max-w-[1320px]">
            {children}
          </div>
        </main>
      </div>
    </AppShellGate>
  );
}
