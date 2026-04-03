import Header from "@/components/layout/Header";
import EmployeesClient from "@/components/employees/EmployeesClient";

export default function EmployeesPage() {
  return (
    <div className="page">
      <Header title="직원 관리" />
      <div className="page-content">
        <EmployeesClient />
      </div>
    </div>
  );
}
