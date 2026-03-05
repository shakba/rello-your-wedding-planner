import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SidebarLayout from "@/components/SidebarLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Trash2, Eye } from "lucide-react";

const AdminDashboard = () => {
  const [couples, setCouples] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCouple, setNewCouple] = useState({
    email: "",
    password: "",
    full_name: "",
    plan: "starter",
    max_guests: 100,
  });

  const loadCouples = async () => {
    // Get all weddings
    const { data: weddings } = await supabase
      .from("weddings")
      .select("*")
      .order("created_at", { ascending: false });

    if (weddings) {
      // Get profiles for all wedding owners
      const userIds = weddings.map((w) => w.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const profileMap: Record<string, string> = {};
      if (profiles) {
        for (const p of profiles) profileMap[p.user_id] = p.full_name || "";
      }
      // Get guest counts per wedding
      const weddingIds = weddings.map((w) => w.id);
      const { data: guests } = await supabase
        .from("guests")
        .select("wedding_id, rsvp_status")
        .in("wedding_id", weddingIds);

      const guestCounts: Record<string, { total: number; confirmed: number }> = {};
      if (guests) {
        for (const g of guests) {
          if (!guestCounts[g.wedding_id]) guestCounts[g.wedding_id] = { total: 0, confirmed: 0 };
          guestCounts[g.wedding_id].total++;
          if (g.rsvp_status === "confirmed") guestCounts[g.wedding_id].confirmed++;
        }
      }

      setCouples(
        weddings.map((w) => ({
          ...w,
          profileName: profileMap[w.user_id] || "",
          guestCount: guestCounts[w.id]?.total || 0,
          confirmedCount: guestCounts[w.id]?.confirmed || 0,
        }))
      );
    }
  };

  useEffect(() => {
    loadCouples();
  }, []);

  const createCouple = async () => {
    if (!newCouple.email || !newCouple.password || !newCouple.full_name) {
      toast.error("מלאו את כל השדות");
      return;
    }
    setCreating(true);

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newCouple.email,
      password: newCouple.password,
      options: {
        data: { full_name: newCouple.full_name },
      },
    });

    if (authError || !authData.user) {
      toast.error(authError?.message || "שגיאה ביצירת משתמש");
      setCreating(false);
      return;
    }

    // Note: The profile is auto-created by the trigger
    // Create the wedding for this user
    const maxGuests = newCouple.plan === "grand" ? 9999 : 100;
    await supabase.from("weddings").insert({
      user_id: authData.user.id,
      plan: newCouple.plan,
      max_guests: maxGuests,
    });

    // Assign couple role
    await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: "couple" as any,
    });

    toast.success("חשבון נוצר בהצלחה!");
    setIsCreateOpen(false);
    setNewCouple({ email: "", password: "", full_name: "", plan: "starter", max_guests: 100 });
    setCreating(false);
    loadCouples();
  };

  const starterCount = couples.filter((c) => c.plan === "starter").length;
  const grandCount = couples.filter((c) => c.plan === "grand").length;

  return (
    <SidebarLayout variant="admin">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">פאנל ניהול</h1>
        <p className="text-muted-foreground font-body mt-1">ניהול זוגות וחשבונות במערכת</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "זוגות פעילים", value: couples.length },
          { label: "חבילות Starter", value: starterCount },
          { label: "חבילות Grand", value: grandCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground font-body mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-border/50">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-display font-semibold">זוגות במערכת</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <UserPlus size={18} />
                פתיחת חשבון חדש
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">פתיחת חשבון לזוג</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body">שם הזוג *</Label>
                  <Input
                    value={newCouple.full_name}
                    onChange={(e) => setNewCouple({ ...newCouple, full_name: e.target.value })}
                    className="font-body"
                    placeholder="שרה וג׳יימס"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">אימייל *</Label>
                  <Input
                    value={newCouple.email}
                    onChange={(e) => setNewCouple({ ...newCouple, email: e.target.value })}
                    type="email"
                    dir="ltr"
                    className="font-body text-left"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">סיסמה *</Label>
                  <Input
                    value={newCouple.password}
                    onChange={(e) => setNewCouple({ ...newCouple, password: e.target.value })}
                    type="password"
                    dir="ltr"
                    className="font-body text-left"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">חבילה</Label>
                  <Select
                    value={newCouple.plan}
                    onValueChange={(v) => setNewCouple({ ...newCouple, plan: v })}
                  >
                    <SelectTrigger className="font-body">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter – $149</SelectItem>
                      <SelectItem value="grand">Grand – $249</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="hero" onClick={createCouple} className="w-full" disabled={creating}>
                  {creating ? "יוצר..." : "צור חשבון"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {couples.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground font-body">
              עדיין אין זוגות במערכת. פתחו חשבון חדש כדי להתחיל.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">שם הזוג</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">חבילה</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">מוזמנים</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">אישורים</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">תאריך חתונה</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">אתר</th>
              </tr>
            </thead>
            <tbody>
              {couples.map((couple) => (
                <tr key={couple.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-body text-sm font-medium">
                    {couple.partner1_name && couple.partner2_name
                      ? `${couple.partner1_name} & ${couple.partner2_name}`
                      : couple.profileName || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-body font-medium ${
                        couple.plan === "grand"
                          ? "bg-gold/10 text-gold"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {couple.plan === "grand" ? "Grand" : "Starter"}
                    </span>
                  </td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{couple.guestCount}</td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{couple.confirmedCount}</td>
                  <td className="p-4 font-body text-sm text-muted-foreground">
                    {couple.wedding_date
                      ? new Date(couple.wedding_date).toLocaleDateString("he-IL")
                      : "—"}
                  </td>
                  <td className="p-4">
                    {couple.website_slug ? (
                      <a
                        href={`/w/${couple.website_slug}`}
                        target="_blank"
                        className="text-primary hover:underline text-sm font-body"
                      >
                        <Eye size={14} className="inline ml-1" />
                        צפייה
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm font-body">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
