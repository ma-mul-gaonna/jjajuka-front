import Header from "@/components/layout/Header";
import MyScheduleClient from "@/components/my-schedule/MyScheduleClient";

export default function MySchedulePage() {
  return (
    <div className="page">
      <Header title="내 근무표" />
      <div className="page-content">
        <MyScheduleClient />
      </div>
    </div>
  );
}
