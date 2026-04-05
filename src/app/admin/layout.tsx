import Sidebar from "@/components/layout/Sidebar";
import NotificationsProvider from "@/components/layout/NotificationsProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      <div className="app-layout">
        <Sidebar role="admin" />
        <div className="app-main">
          {children}
        </div>
      </div>
    </NotificationsProvider>
  );
}
