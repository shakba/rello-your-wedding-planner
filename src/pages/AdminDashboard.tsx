import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  Settings,
  LogOut,
  UserPlus,
  Package,
  Shield,
} from "lucide-react";

const adminLinks = [
  { icon: Users, label: "ניהול זוגות", href: "/admin" },
  { icon: UserPlus, label: "פתיחת חשבון", href: "/admin/create" },
  { icon: Package, label: "חבילות", href: "/admin/packages" },
  { icon: Settings, label: "הגדרות מערכת", href: "/admin/settings" },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-l border-border p-6 flex flex-col">
        <Link to="/" className="mb-2">
          <span className="text-2xl font-display font-bold text-gradient-hero">Rello</span>
        </Link>
        <div className="flex items-center gap-2 mb-8 px-1">
          <Shield size={14} className="text-primary" />
          <span className="text-xs font-body text-primary font-semibold">ניהול מערכת</span>
        </div>

        <nav className="flex-1 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-body text-sm"
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" className="justify-start gap-3 text-muted-foreground" asChild>
          <Link to="/">
            <LogOut size={18} />
            התנתקות
          </Link>
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">פאנל ניהול</h1>
          <p className="text-muted-foreground font-body mt-1">ניהול זוגות וחשבונות במערכת</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "זוגות פעילים", value: "0" },
            { label: "חשבונות Starter", value: "0" },
            { label: "חשבונות Grand", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <p className="text-sm text-muted-foreground font-body mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold">זוגות במערכת</h2>
            <Button variant="hero" asChild>
              <Link to="/admin/create">
                <UserPlus size={18} />
                פתיחת חשבון חדש
              </Link>
            </Button>
          </div>
          <p className="text-center text-muted-foreground font-body py-12">
            עדיין אין זוגות במערכת. פתחו חשבון חדש כדי להתחיל.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
