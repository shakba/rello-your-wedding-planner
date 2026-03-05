import { useEffect, useMemo, useState } from "react";
import { Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type CoupleRecord = {
  id: string; user_id: string; plan: string | null;
  partner1_name: string; partner2_name: string;
  wedding_date: string | null; website_slug: string | null;
  guestCount: number; confirmedCount: number; displayName: string;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [couples, setCouples] = useState<CoupleRecord[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCouple, setNewCouple] = useState({ full_name: "", email: "", password: "", plan: "starter" });

  const loadCouples = async () => {
    setLoading(true);
    const { data: weddings, error } = await supabase
      .from("weddings")
      .select("id, user_id, plan, partner1_name, partner2_name, wedding_date, website_slug")
      .order("created_at", { ascending: false });

    if (error || !weddings) { toast.error("לא הצלחנו לטעון את רשימת הזוגות"); setCouples([]); setLoading(false); return; }
    if (weddings.length === 0) { setCouples([]); setLoading(false); return; }

    const userIds = [...new Set(weddings.map((w) => w.user_id))];
    const weddingIds = weddings.map((w) => w.id);
    const [profilesRes, guestsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
      supabase.from("guests").select("wedding_id, rsvp_status").in("wedding_id", weddingIds),
    ]);

    const profileMap = new Map<string, string>();
    for (const p of profilesRes.data ?? []) profileMap.set(p.user_id, p.full_name ?? "");
    const guestCounts = new Map<string, { total: number; confirmed: number }>();
    for (const g of guestsRes.data ?? []) {
      const c = guestCounts.get(g.wedding_id) ?? { total: 0, confirmed: 0 };
      c.total += 1; if (g.rsvp_status === "confirmed") c.confirmed += 1;
      guestCounts.set(g.wedding_id, c);
    }

    setCouples(weddings.map((w) => {
      const s = guestCounts.get(w.id) ?? { total: 0, confirmed: 0 };
      const title = [w.partner1_name, w.partner2_name].filter(Boolean).join(" & ");
      return { ...w, guestCount: s.total, confirmedCount: s.confirmed, displayName: title || profileMap.get(w.user_id) || "ללא שם" };
    }));
    setLoading(false);
  };

  useEffect(() => { void loadCouples(); }, []);

  const createCouple = async () => {
    if (!newCouple.full_name.trim() || !newCouple.email.trim() || !newCouple.password.trim()) { toast.error("יש למלא את כל השדות"); return; }
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("admin-create-couple", {
      body: { full_name: newCouple.full_name.trim(), email: newCouple.email.trim().toLowerCase(), password: newCouple.password, plan: newCouple.plan },
    });
    setCreating(false);
    const resErr = typeof data === "object" && data !== null && "error" in data ? String(data.error ?? "") : "";
    if (error || resErr) { toast.error(resErr || error?.message || "לא הצלחנו ליצור חשבון חדש"); return; }
    toast.success("הזוג נוצר בהצלחה");
    setNewCouple({ full_name: "", email: "", password: "", plan: "starter" });
    setIsCreateOpen(false);
    void loadCouples();
  };

  const stats = useMemo(() => ({
    total: couples.length,
    starter: couples.filter((c) => c.plan !== "grand").length,
    grand: couples.filter((c) => c.plan === "grand").length,
  }), [couples]);

  return (
    <SidebarLayout variant="admin">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold">פאנל ניהול</h1>
          <p className="mt-2 text-xl font-body text-muted-foreground">ניהול זוגות, חבילות וסטטוס אתרים.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero"><UserPlus size={18} /> פתיחת חשבון חדש</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-2xl font-display">פתיחת חשבון לזוג חדש</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label className="font-body">שם הזוג</Label><Input value={newCouple.full_name} onChange={(e) => setNewCouple((p) => ({ ...p, full_name: e.target.value }))} className="font-body" /></div>
              <div className="space-y-2"><Label className="font-body">אימייל</Label><Input type="email" value={newCouple.email} onChange={(e) => setNewCouple((p) => ({ ...p, email: e.target.value }))} className="font-body" dir="ltr" /></div>
              <div className="space-y-2"><Label className="font-body">סיסמה זמנית</Label><Input type="password" value={newCouple.password} onChange={(e) => setNewCouple((p) => ({ ...p, password: e.target.value }))} className="font-body" dir="ltr" /></div>
              <div className="space-y-2">
                <Label className="font-body">חבילה</Label>
                <Select value={newCouple.plan} onValueChange={(v) => setNewCouple((p) => ({ ...p, plan: v }))}>
                  <SelectTrigger className="font-body"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="grand">Grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="hero" className="w-full" onClick={createCouple} disabled={creating}>{creating ? "יוצר..." : "צור חשבון"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "זוגות פעילים", value: stats.total },
          { label: "חבילות Starter", value: stats.starter },
          { label: "חבילות Grand", value: stats.grand },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="font-body text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-4xl font-display font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
        ) : couples.length === 0 ? (
          <div className="py-16 text-center font-body text-muted-foreground">אין זוגות במערכת כרגע.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border text-right text-sm font-body text-muted-foreground">
                  <th className="px-3 py-3">שם הזוג</th>
                  <th className="px-3 py-3">חבילה</th>
                  <th className="px-3 py-3">מוזמנים</th>
                  <th className="px-3 py-3">אישורים</th>
                  <th className="px-3 py-3">תאריך חתונה</th>
                  <th className="px-3 py-3">אתר</th>
                </tr>
              </thead>
              <tbody>
                {couples.map((c) => (
                  <tr key={c.id} className="border-b border-border/70 font-body text-sm">
                    <td className="px-3 py-3 font-medium">{c.displayName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.plan === "grand" ? "Grand" : "Starter"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.guestCount}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.confirmedCount}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.wedding_date ? new Date(c.wedding_date).toLocaleDateString("he-IL") : "—"}</td>
                    <td className="px-3 py-3">
                      {c.website_slug ? (
                        <a href={`/w/${c.website_slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80">
                          <Eye size={14} /> צפייה
                        </a>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SidebarLayout>
  );
};

export default AdminDashboard;
