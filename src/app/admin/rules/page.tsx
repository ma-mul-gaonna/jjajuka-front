import Header from "@/components/layout/Header";
import RulesClient from "@/components/rules/RulesClient";

export default function RulesPage() {
  return (
    <div className="page">
      <Header title="규칙 설정" />
      <div className="page-content">
        <RulesClient />
      </div>
    </div>
  );
}