import { SidebarNav } from '@/components/sidebar-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 ml-64 p-8 min-h-screen bg-background">
        {children}
      </main>
    </div>
  );
}
