import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>
      <div className="header-right">
        <button className="header-icon-btn" aria-label="검색">
          <Search size={18} />
        </button>
        <button className="header-icon-btn header-notification-btn" aria-label="알림">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>
        <div className="header-avatar">J</div>
      </div>
    </header>
  );
}
