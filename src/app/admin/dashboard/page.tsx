import Header from "@/components/layout/Header";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <div className="page">
      <Header title="대시보드" />
      <div className="page-content">
        <DashboardClient />
      </div>
    </div>
  );
}
