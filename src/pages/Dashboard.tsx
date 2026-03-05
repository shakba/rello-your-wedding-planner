import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  Globe,
  MessageSquare,
  LayoutGrid,
  Gift,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";

const sidebarLinks = [
  { icon: BarChart3, label: "סקירה כללית", href: "/dashboard" },
  { icon: Globe, label: "אתר החתונה", href: "/dashboard/website" },
  { icon: Users, label: "מוזמנים", href: "/dashboard/guests" },
  { icon: MessageSquare, label: "הזמנות", href: "/dashboard/invitations" },
  { icon: LayoutGrid, label: "תכנון ישיבה", href: "/dashboard/seating" },
  { icon: Gift, label: "רשימת מתנות", href: "/dashboard/registry" },
  { icon: Settings, label: "הגדרות", href: "/dashboard/settings" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-l border-border p-6 flex flex-col">
        <Link to="/" className="mb-8">
          <span className="text-2xl font-display font-bold text-gradient-hero">Rello</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link) => (
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
          <h1 className="text-3xl font-display font-bold">שלום, שרה וג׳יימס 💍</h1>
          <p className="text-muted-foreground font-body mt-1">ברוכים הבאים לדשבורד החתונה שלכם</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "סה״כ מוזמנים", value: "0", color: "primary" },
            { label: "אישרו הגעה", value: "0", color: "sage" },
            { label: "ממתינים", value: "0", color: "gold" },
            { label: "דחו", value: "0", color: "destructive" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
              <p className="text-sm text-muted-foreground font-body mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
          <p className="text-muted-foreground font-body mb-4">התחילו לבנות את החתונה שלכם!</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="hero" asChild>
              <Link to="/dashboard/website">בנו את האתר</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/guests">הוסיפו מוזמנים</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
