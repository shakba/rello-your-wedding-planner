import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  Users,
  CalendarCheck,
  Armchair,
  Gift,
  Settings,
  Shield,
  LogOut,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarLayoutProps {
  children: ReactNode;
  variant: "couple" | "admin";
}

const coupleLinks = [
  { icon: LayoutDashboard, label: "סקירה כללית", href: "/dashboard" },
  { icon: Globe, label: "אתר החתונה", href: "/dashboard/website" },
  { icon: Users, label: "מוזמנים", href: "/dashboard/guests" },
  { icon: CalendarCheck, label: "אישורי הגעה", href: "/dashboard/rsvps" },
  { icon: Armchair, label: "תכנון ישיבה", href: "/dashboard/seating" },
  { icon: Gift, label: "רשימת מתנות", href: "/dashboard/registry" },
  { icon: Settings, label: "הגדרות", href: "/dashboard/settings" },
];

const adminLinks = [
  { icon: LayoutDashboard, label: "סקירה כללית", href: "/admin" },
  { icon: Users, label: "ניהול זוגות", href: "/admin/create" },
  { icon: Gift, label: "חבילות", href: "/admin/packages" },
  { icon: Settings, label: "הגדרות", href: "/admin/settings" },
];

const SidebarLayout = ({ children, variant }: SidebarLayoutProps) => {
  const { signOut } = useAuth();
  const links = variant === "admin" ? adminLinks : coupleLinks;

  return (
    <div className="min-h-screen bg-gradient-warm" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="text-4xl font-display font-bold text-foreground">Rello</span>
            </Link>
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-body text-muted-foreground">
              {variant === "admin" ? "ניהול מערכת" : "דשבורד הזוג"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {variant === "couple" && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/website" className="gap-2">
                  <Eye size={14} /> צפייה באתר
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => void signOut()} className="text-muted-foreground">
              <LogOut size={16} />
              התנתקות
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-81px)]">
        <aside className="w-72 shrink-0 border-l border-border bg-card/80 p-5 backdrop-blur-sm">
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/dashboard" || link.href === "/admin"}
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-body text-[1.05rem] text-muted-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary font-semibold"
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div
            className={cn(
              "mt-8 rounded-2xl border border-border p-5 shadow-card",
              variant === "admin" ? "bg-secondary" : "bg-primary text-primary-foreground",
            )}
          >
            <p className={cn("font-display text-2xl font-bold", variant === "admin" && "text-foreground")}>צריכים עזרה?</p>
            <p
              className={cn(
                "mt-2 font-body text-sm",
                variant === "admin" ? "text-muted-foreground" : "text-primary-foreground/90",
              )}
            >
              {variant === "admin"
                ? "ניהול החשבונות, החבילות והתכנים מרוכז כאן."
                : "קבלו ליווי אישי לתכנון החתונה שלכם"}
            </p>
            <Button
              variant={variant === "admin" ? "outline" : "secondary"}
              className="mt-4 w-full"
              type="button"
            >
              יצירת קשר
            </Button>
          </div>

          {variant === "admin" && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-body text-muted-foreground">
              <Shield size={14} className="text-primary" />
              מצב ניהול
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
