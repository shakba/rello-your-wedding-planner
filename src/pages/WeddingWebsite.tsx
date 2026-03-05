import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Wedding } from "@/types/wedding";
import WeddingHero from "@/components/wedding-site/WeddingHero";
import WeddingDetails from "@/components/wedding-site/WeddingDetails";
import WeddingRsvp from "@/components/wedding-site/WeddingRsvp";

type PublicWedding = Pick<
  Wedding,
  "id" | "partner1_name" | "partner2_name" | "wedding_date" | "story" | "venue_name" | "venue_address" | "dress_code"
>;

const WeddingWebsite = () => {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<PublicWedding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void supabase
      .from("weddings")
      .select("id, partner1_name, partner2_name, wedding_date, story, venue_name, venue_address, dress_code")
      .eq("website_slug", slug)
      .eq("website_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setWedding((data as PublicWedding | null) ?? null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const coupleNames = useMemo(() => {
    if (!wedding) return "החתונה שלנו";
    return [wedding.partner1_name, wedding.partner2_name].filter(Boolean).join(" & ") || "החתונה שלנו";
  }, [wedding]);

  const weddingDateLabel = useMemo(() => {
    if (!wedding?.wedding_date) return null;

    return new Date(wedding.wedding_date).toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [wedding?.wedding_date]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-card">
          <h1 className="text-4xl font-display font-bold">האתר לא נמצא</h1>
          <p className="mt-2 font-body text-muted-foreground">ייתכן שהאתר טרם פורסם או שהכתובת שגויה.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <WeddingHero coupleNames={coupleNames} weddingDateLabel={weddingDateLabel} />
      <WeddingDetails
        story={wedding.story}
        venueName={wedding.venue_name}
        venueAddress={wedding.venue_address}
        dressCode={wedding.dress_code}
      />
      <WeddingRsvp weddingId={wedding.id} />

      <footer className="border-t border-border py-6 text-center font-body text-muted-foreground">
        Built with <Heart size={13} className="inline text-primary" /> Rello
      </footer>
    </main>
  );
};

export default WeddingWebsite;
