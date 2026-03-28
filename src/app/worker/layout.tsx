import Sidebar from "@/components/layout/Sidebar";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar role="employee" />
      <div className="app-main">
        {children}
      </div>
    </div>
  );
}
