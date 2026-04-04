import Header from "@/components/layout/Header";
import HomeClient from "@/components/home/HomeClient";

export default function DashboardPage() {
  return (
    <div className="page">
      <Header title="홈" />
      <div className="page-content">
        <HomeClient />
      </div>
    </div>
  );
}
