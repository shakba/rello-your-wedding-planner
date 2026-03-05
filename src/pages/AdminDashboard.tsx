import { useEffect, useMemo, useState } from "react";
import { Eye, UserPlus } from "lucide-react";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type CoupleRecord = {
  id: string;
  user_id: string;
  plan: string | null;
  partner1_name: string;
  partner2_name: string;
  wedding_date: string | null;
  website_slug: string | null;
  guestCount: number;
  confirmedCount: number;
  displayName: string;
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [couples, setCouples] = useState<CoupleRecord[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newCouple, setNewCouple] = useState({
    full_name: "",
    email: "",
    password: "",
    plan: "starter",
  });

  const loadCouples = async () => {
    setLoading(true);

    const { data: weddings, error: weddingsError } = await supabase
      .from("weddings")
      .select("id, user_id, plan, partner1_name, partner2_name, wedding_date, website_slug")
      .order("created_at", { ascending: false });

    if (weddingsError || !weddings) {
      toast.error("לא הצלחנו לטעון את רשימת הזוגות");
      setCouples([]);
      setLoading(false);
      return;
    }

    if (weddings.length === 0) {
      setCouples([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(weddings.map((wedding) => wedding.user_id))];
    const weddingIds = weddings.map((wedding) => wedding.id);

    const [profilesRes, guestsRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
      supabase.from("guests").select("wedding_id, rsvp_status").in("wedding_id", weddingIds),
    ]);

    const profileNameByUserId = new Map<string, string>();
    for (const profile of profilesRes.data ?? []) {
      profileNameByUserId.set(profile.user_id, profile.full_name ?? "");
    }

    const guestCounts = new Map<string, { total: number; confirmed: number }>();
    for (const guest of guestsRes.data ?? []) {
      const current = guestCounts.get(guest.wedding_id) ?? { total: 0, confirmed: 0 };
      current.total += 1;
      if (guest.rsvp_status === "confirmed") current.confirmed += 1;
      guestCounts.set(guest.wedding_id, current);
    }

    const nextCouples: CoupleRecord[] = weddings.map((wedding) => {
      const stats = guestCounts.get(wedding.id) ?? { total: 0, confirmed: 0 };
      const title = [wedding.partner1_name, wedding.partner2_name].filter(Boolean).join(" & ");

      return {
        ...wedding,
        guestCount: stats.total,
        confirmedCount: stats.confirmed,
        displayName: title || profileNameByUserId.get(wedding.user_id) || "Unnamed Couple",
      };
    });

    setCouples(nextCouples);
    setLoading(false);
  };

  useEffect(() => {
    void loadCouples();
  }, []);

  const createCouple = async () => {
    if (!newCouple.full_name.trim() || !newCouple.email.trim() || !newCouple.password.trim()) {
      toast.error("יש למלא את כל השדות");
      return;
    }

    setCreating(true);
    const { data, error } = await supabase.functions.invoke("admin-create-couple", {
      body: {
        full_name: newCouple.full_name.trim(),
        email: newCouple.email.trim().toLowerCase(),
        password: newCouple.password,
        plan: newCouple.plan,
      },
    });
    setCreating(false);

    const responseError =
      typeof data === "object" && data !== null && "error" in data ? String(data.error ?? "") : "";

    if (error || responseError) {
      toast.error(responseError || error?.message || "לא הצלחנו ליצור חשבון חדש");
      return;
    }

    toast.success("הזוג נוצר בהצלחה");
    setNewCouple({ full_name: "", email: "", password: "", plan: "starter" });
    setIsCreateOpen(false);
    void loadCouples();
  };

  const stats = useMemo(
    () => ({
      total: couples.length,
      starter: couples.filter((couple) => couple.plan !== "grand").length,
      grand: couples.filter((couple) => couple.plan === "grand").length,
    }),
    [couples],
  );

  return (
    <SidebarLayout variant="admin">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-xl font-body text-muted-foreground">Manage couples, plans and website status.</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <UserPlus size={18} />
              Create couple account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">פתיחת חשבון לזוג חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-body">שם הזוג</Label>
                <Input
                  value={newCouple.full_name}
                  onChange={(event) => setNewCouple((prev) => ({ ...prev, full_name: event.target.value }))}
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body">אימייל</Label>
                <Input
                  type="email"
                  value={newCouple.email}
                  onChange={(event) => setNewCouple((prev) => ({ ...prev, email: event.target.value }))}
                  className="font-body"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body">סיסמה זמנית</Label>
                <Input
                  type="password"
                  value={newCouple.password}
                  onChange={(event) => setNewCouple((prev) => ({ ...prev, password: event.target.value }))}
                  className="font-body"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body">חבילה</Label>
                <Select
                  value={newCouple.plan}
                  onValueChange={(value) => setNewCouple((prev) => ({ ...prev, plan: value }))}
                >
                  <SelectTrigger className="font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="grand">Grand</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="hero" className="w-full" onClick={createCouple} disabled={creating}>
                {creating ? "יוצר..." : "Create account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Active Couples", value: stats.total },
          { label: "Starter Plans", value: stats.starter },
          { label: "Grand Plans", value: stats.grand },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="font-body text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-4xl font-display font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : couples.length === 0 ? (
          <div className="py-16 text-center font-body text-muted-foreground">אין זוגות במערכת כרגע.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border text-right text-sm font-body text-muted-foreground">
                  <th className="px-3 py-3">Couple</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Guests</th>
                  <th className="px-3 py-3">Confirmed</th>
                  <th className="px-3 py-3">Wedding Date</th>
                  <th className="px-3 py-3">Website</th>
                </tr>
              </thead>
              <tbody>
                {couples.map((couple) => (
                  <tr key={couple.id} className="border-b border-border/70 font-body text-sm">
                    <td className="px-3 py-3 font-medium">{couple.displayName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{couple.plan === "grand" ? "Grand" : "Starter"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{couple.guestCount}</td>
                    <td className="px-3 py-3 text-muted-foreground">{couple.confirmedCount}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {couple.wedding_date ? new Date(couple.wedding_date).toLocaleDateString("he-IL") : "—"}
                    </td>
                    <td className="px-3 py-3">
                      {couple.website_slug ? (
                        <a
                          href={`/w/${couple.website_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary transition-colors hover:text-primary/80"
                        >
                          <Eye size={14} />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
