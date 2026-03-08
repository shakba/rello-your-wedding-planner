import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckSquare, Clock3, Users, XCircle } from "lucide-react";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { EMPTY_GUEST_STATS, GuestStats, Profile } from "@/types/wedding";

const Dashboard = () => {
  const { user } = useAuth();
  const { wedding, loading: weddingLoading, ensureWedding } = useWedding(user?.id);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<GuestStats>(EMPTY_GUEST_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [creatingWedding, setCreatingWedding] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!user.id) return;
    void ensureWedding();
  }, [user, ensureWedding]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    void supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setProfile(data ?? null);
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || weddingLoading || wedding || creatingWedding) return;
    setCreatingWedding(true);
    void ensureWedding().finally(() => setCreatingWedding(false));
  }, [user?.id, weddingLoading, wedding, ensureWedding, creatingWedding]);

  useEffect(() => {
    if (!wedding?.id) {
      setStats(EMPTY_GUEST_STATS);
      setStatsLoading(false);
      return;
    }
    let cancelled = false;
    setStatsLoading(true);
    const guestRequest = supabase.from("guests").select("rsvp_status, plus_ones").eq("wedding_id", wedding.id);
    guestRequest.then(
      ({ data }) => {
        if (cancelled) return;

        const total = (data ?? []).reduce((sum, guest) => sum + 1 + Math.max(guest.plus_ones ?? 0, 0), 0);
        const confirmed = (data ?? [])
          .filter((g) => g.rsvp_status === "confirmed")
          .reduce((sum, guest) => sum + 1 + Math.max(guest.plus_ones ?? 0, 0), 0);
        const declined = (data ?? [])
          .filter((g) => g.rsvp_status === "declined")
          .reduce((sum, guest) => sum + 1 + Math.max(guest.plus_ones ?? 0, 0), 0);
        const pending = total - confirmed - declined;
        const responded = confirmed + declined;
        const responseRate = total > 0 ? Number(((responded / total) * 100).toFixed(1)) : 0;
        setStats({ total, confirmed, declined, pending, responded, responseRate });
        setStatsLoading(false);
      },
      () => { if (!cancelled) setStatsLoading(false); },
    );
    return () => { cancelled = true; };
  }, [wedding?.id]);

  const displayName = profile?.full_name || user?.email || "זוג יקר";
  const loading = weddingLoading || creatingWedding || statsLoading;

  const statCards = useMemo(
    () => [
      { label: "סה״כ אורחים", value: stats.total, icon: Users, iconClassName: "bg-primary/10 text-primary" },
      { label: "אישרו הגעה", value: stats.confirmed, icon: CheckSquare, iconClassName: "bg-sage-light text-sage" },
      { label: "דחו", value: stats.declined, icon: XCircle, iconClassName: "bg-destructive/10 text-destructive" },
      { label: "ממתינים", value: stats.pending, icon: Clock3, iconClassName: "bg-secondary text-muted-foreground" },
    ],
    [stats],
  );

  return (
    <SidebarLayout variant="couple">
      <section>
        <h1 className="text-5xl font-display font-bold text-foreground">דשבורד</h1>
        <p className="mt-2 text-2xl font-body text-muted-foreground">שלום, {displayName} 💍</p>
      </section>

      {loading ? (
        <div className="mt-8 flex items-center justify-center rounded-3xl border border-border bg-card p-16 shadow-card">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => (
              <article key={item.label} className="rounded-3xl border border-border bg-card p-7 shadow-card">
                <div className="mb-8 flex items-center justify-between">
                  <span className={`rounded-2xl p-3 ${item.iconClassName}`}>
                    <item.icon size={26} />
                  </span>
                  <ArrowUpRight size={18} className="text-muted-foreground" />
                </div>
                <p className="text-5xl font-display font-bold text-foreground">{item.value}</p>
                <p className="mt-3 font-body text-2xl text-muted-foreground">{item.label}</p>
              </article>
            ))}
          </section>

          <section className="mt-7 rounded-3xl border border-border bg-card p-8 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-display font-bold">התקדמות אישורים</h2>
              <Link to="/dashboard/guests" className="font-body text-muted-foreground transition-colors hover:text-primary">
                הצג הכל
              </Link>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between text-sm font-body text-muted-foreground">
                <span>אחוז מענה</span>
                <span>{stats.responseRate}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-foreground transition-all" style={{ width: `${Math.min(stats.responseRate, 100)}%` }} />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 text-center md:grid-cols-3">
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-3xl font-display font-bold text-sage">
                  {stats.total > 0 ? ((stats.confirmed / stats.total) * 100).toFixed(1) : "0"}%
                </p>
                <p className="mt-1 font-body text-muted-foreground">מגיעים</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-3xl font-display font-bold text-destructive">
                  {stats.total > 0 ? ((stats.declined / stats.total) * 100).toFixed(1) : "0"}%
                </p>
                <p className="mt-1 font-body text-muted-foreground">דחו</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-3xl font-display font-bold text-accent">
                  {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : "0"}%
                </p>
                <p className="mt-1 font-body text-muted-foreground">ממתינים</p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="text-3xl font-display font-bold">פעולות מהירות</h2>
            <p className="mt-1 font-body text-muted-foreground">הכל מוכן — אפשר להמשיך לבנייה וניהול בלחיצה אחת.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="hero" asChild>
                <Link to="/dashboard/website">עריכת אתר החתונה</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/guests">ניהול מוזמנים</Link>
              </Button>
            </div>
          </section>
        </>
      )}
    </SidebarLayout>
  );
};

export default Dashboard;
