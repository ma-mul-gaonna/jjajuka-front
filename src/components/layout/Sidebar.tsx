"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Settings2,
  Users,
  CalendarCheck,
  ArrowLeftRight,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "admin" | "employee";
}

const adminNav: NavItem[] = [
  {
    label: "대시보드",
    href: "/admin/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { label: "근무표 생성", href: "/admin/schedule", icon: <CalendarDays size={18} /> },
  { label: "규칙 설정", href: "/admin/rules", icon: <Settings2 size={18} /> },
  { label: "직원 관리", href: "/admin/employees", icon: <Users size={18} /> },
  { label: "대체인력 추천", href: "/admin/substitute", icon: <Sparkles size={18} /> },
];

const employeeNav: NavItem[] = [
  {
    label: "내 근무표",
    href: "/worker/my-schedule",
    icon: <CalendarCheck size={18} />,
  },
  {
    label: "결원/대타 요청",
    href: "/worker/requests",
    icon: <ArrowLeftRight size={18} />,
  },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const navItems = role === "admin" ? adminNav : employeeNav;

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CalendarDays size={20} color="#FFF" />
        </div>
        <span className="sidebar-logo-text">짜주까</span>
      </div>

      {/* Role Badge */}
      <div className="sidebar-role-badge">
        {role === "admin" ? "관리자" : "직원"}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">메뉴</p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" suppressHydrationWarning>
            {user?.name?.[0] ?? "?"}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name" suppressHydrationWarning>{user?.name ?? "-"}</p>
            <p className="sidebar-user-role">
              {role === "admin" ? "관리자" : "직원"}
            </p>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
