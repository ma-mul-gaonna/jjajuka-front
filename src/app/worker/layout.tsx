import Sidebar from "@/components/layout/Sidebar";
import NotificationsProvider from "@/components/layout/NotificationsProvider";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      <div className="app-layout">
        <Sidebar role="employee" />
        <div className="app-main">
          {children}
        </div>
      </div>
    </NotificationsProvider>
  );
}
