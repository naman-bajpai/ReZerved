import { SidebarNav } from '@/components/sidebar-nav';
import { AppShellGate } from '@/components/app-shell-gate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellGate>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 min-h-screen bg-background">{children}</main>
      </div>
    </AppShellGate>
  );
}
