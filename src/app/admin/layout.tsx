import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar role="admin" />
      <div className="app-main">
        {children}
      </div>
    </div>
  );
}
