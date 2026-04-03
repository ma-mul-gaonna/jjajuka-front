import Header from "@/components/layout/Header";
import ScheduleClient from "@/components/schedule/ScheduleClient";

export default function SchedulePage() {
  return (
    <div className="page">
      <Header title="근무표 생성" />
      <div className="page-content">
        <ScheduleClient />
      </div>
    </div>
  );
}
