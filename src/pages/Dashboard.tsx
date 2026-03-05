import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, declined: 0 });
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(profileData);

      // Load wedding
      const { data: weddingData } = await supabase
        .from("weddings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setWedding(weddingData);

      if (weddingData) {
        // Load guest stats
        const { data: guests } = await supabase
          .from("guests")
          .select("rsvp_status")
          .eq("wedding_id", weddingData.id);

        if (guests) {
          setStats({
            total: guests.length,
            confirmed: guests.filter((g) => g.rsvp_status === "confirmed").length,
            pending: guests.filter((g) => g.rsvp_status === "pending").length,
            declined: guests.filter((g) => g.rsvp_status === "declined").length,
          });
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Auto-create wedding if none exists
  useEffect(() => {
    if (!loading && !wedding && user) {
      supabase
        .from("weddings")
        .insert({ user_id: user.id, partner1_name: "", partner2_name: "" })
        .select()
        .single()
        .then(({ data }) => {
          if (data) setWedding(data);
        });
    }
  }, [loading, wedding, user]);

  const displayName = profile?.full_name || user?.email || "שלום";

  return (
    <SidebarLayout variant="couple">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">שלום, {displayName} 💍</h1>
        <p className="text-muted-foreground font-body mt-1">ברוכים הבאים לדשבורד החתונה שלכם</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "סה״כ מוזמנים", value: stats.total },
          { label: "אישרו הגעה", value: stats.confirmed },
          { label: "ממתינים", value: stats.pending },
          { label: "דחו", value: stats.declined },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
            <p className="text-sm text-muted-foreground font-body mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {wedding && (
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center">
          <p className="text-muted-foreground font-body mb-4">
            {stats.total === 0 ? "התחילו לבנות את החתונה שלכם!" : "המשיכו לנהל את החתונה"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="hero" asChild>
              <Link to="/dashboard/website">בנו את האתר</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/guests">נהלו מוזמנים</Link>
            </Button>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default Dashboard;
