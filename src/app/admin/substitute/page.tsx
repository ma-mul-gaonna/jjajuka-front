import Header from "@/components/layout/Header";
import SubstituteClient from "@/components/substitute/SubstituteClient";

export default function SubstitutePage() {
  return (
    <div className="page">
      <Header title="대체인력 추천" />
      <div className="page-content">
        <SubstituteClient />
      </div>
    </div>
  );
}
