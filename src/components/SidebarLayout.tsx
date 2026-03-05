import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, Globe, MessageSquare, LayoutGrid, Gift, Settings, LogOut, BarChart3, Shield, UserPlus, Package,
} from "lucide-react";

interface SidebarLayoutProps {
  children: ReactNode;
  variant: "couple" | "admin";
}

const coupleLinks = [
  { icon: BarChart3, label: "סקירה כללית", href: "/dashboard" },
  { icon: Globe, label: "אתר החתונה", href: "/dashboard/website" },
  { icon: Users, label: "מוזמנים", href: "/dashboard/guests" },
  { icon: LayoutGrid, label: "תכנון ישיבה", href: "/dashboard/seating" },
  { icon: Gift, label: "רשימת מתנות", href: "/dashboard/registry" },
  { icon: Settings, label: "הגדרות", href: "/dashboard/settings" },
];

const adminLinks = [
  { icon: Users, label: "ניהול זוגות", href: "/admin" },
  { icon: UserPlus, label: "פתיחת חשבון", href: "/admin/create" },
  { icon: Package, label: "חבילות", href: "/admin/packages" },
  { icon: Settings, label: "הגדרות מערכת", href: "/admin/settings" },
];

const SidebarLayout = ({ children, variant }: SidebarLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const links = variant === "admin" ? adminLinks : coupleLinks;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-l border-border p-6 flex flex-col shrink-0">
        <Link to="/" className="mb-2">
          <span className="text-2xl font-display font-bold text-gradient-hero">Rello</span>
        </Link>
        {variant === "admin" && (
          <div className="flex items-center gap-2 mb-6 px-1">
            <Shield size={14} className="text-primary" />
            <span className="text-xs font-body text-primary font-semibold">ניהול מערכת</span>
          </div>
        )}
        {variant === "couple" && <div className="mb-6" />}

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-body text-sm ${
                  isActive
                    ? "bg-rose-light text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="justify-start gap-3 text-muted-foreground"
          onClick={signOut}
        >
          <LogOut size={18} />
          התנתקות
        </Button>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
};

export default SidebarLayout;
