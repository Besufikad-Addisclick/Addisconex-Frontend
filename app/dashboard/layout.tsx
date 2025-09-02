// app/dashboard/layout.tsx
import DashboardHeader from '@/components/layout/DashboardHeader';
import './../globals.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-[1600px] mx-auto p-4">
        {children}
      </main>
    </div>
  );
}