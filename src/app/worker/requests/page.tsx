import Header from "@/components/layout/Header";
import RequestsClient from "@/components/requests/RequestsClient";

export default function RequestsPage() {
  return (
    <div className="page">
      <Header title="결원/대타 요청" role="worker" />
      <div className="page-content">
        <RequestsClient />
      </div>
    </div>
  );
}
