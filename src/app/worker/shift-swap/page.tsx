import Header from "@/components/layout/Header";
import ShiftSwapReceivedClient from "@/components/requests/ShiftSwapReceivedClient";

export default function ShiftSwapPage() {
  return (
    <div className="page">
      <Header title="받은 교대 요청" role="worker" />
      <div className="page-content">
        <ShiftSwapReceivedClient />
      </div>
    </div>
  );
}
