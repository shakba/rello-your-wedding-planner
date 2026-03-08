import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Wedding } from "@/types/wedding";
import WeddingHero from "@/components/wedding-site/WeddingHero";
import WeddingDetails from "@/components/wedding-site/WeddingDetails";
import WeddingGallery from "@/components/wedding-site/WeddingGallery";
import WeddingRsvp from "@/components/wedding-site/WeddingRsvp";

type TimelineItem = {
  time: string;
  title: string;
};

type PublicWedding = Pick<
  Wedding,
  "id" | "partner1_name" | "partner2_name" | "wedding_date" | "story" | "venue_name" | "venue_address" | "dress_code" | "gallery_urls" | "parent1_parents" | "parent2_parents" | "event_time" | "schedule" | "cover_image_url"
>;

const WeddingWebsite = () => {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<PublicWedding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const normalizedSlug = slug?.trim().toLowerCase();
    if (!normalizedSlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("weddings")
          .select("id, partner1_name, partner2_name, wedding_date, story, venue_name, venue_address, dress_code, gallery_urls, parent1_parents, parent2_parents, event_time, schedule, cover_image_url")
          .eq("website_slug", normalizedSlug)
          .eq("website_published", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled) {
          if (error) console.error("Wedding fetch error:", error);
          setWedding((data as PublicWedding | null) ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Wedding fetch error:", err);
        if (!cancelled) {
          setWedding(null);
          setLoading(false);
        }
      }
    })();

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
    const parsed = new Date(wedding.wedding_date);
    if (Number.isNaN(parsed.getTime())) return null;

    const day = parsed.toLocaleDateString("he-IL", { day: "2-digit" });
    const month = parsed.toLocaleDateString("he-IL", { month: "long" });
    const year = parsed.toLocaleDateString("he-IL", { year: "numeric" });
    return `${day} · ${month} · ${year}`;
  }, [wedding?.wedding_date]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const schedule = wedding?.schedule;
    if (!Array.isArray(schedule)) return [];

    return schedule
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const time = "time" in item && typeof item.time === "string" ? item.time.trim() : "";
        const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
        if (!time || !title) return null;
        return { time, title };
      })
      .filter((item): item is TimelineItem => item !== null);
  }, [wedding?.schedule]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
        <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-card">
          <h1 className="text-4xl font-display font-bold">האתר לא נמצא</h1>
          <p className="mt-2 font-body text-muted-foreground">ייתכן שהאתר טרם פורסם או שהכתובת שגויה.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <WeddingHero
        coupleNames={coupleNames}
        weddingDateLabel={weddingDateLabel}
        coverImageUrl={wedding.cover_image_url || wedding.gallery_urls?.[0] || null}
      />
      <WeddingDetails
        story={wedding.story}
        venueName={wedding.venue_name}
        venueAddress={wedding.venue_address}
        dressCode={wedding.dress_code}
        parent1Parents={wedding.parent1_parents}
        parent2Parents={wedding.parent2_parents}
        eventTime={wedding.event_time}
        schedule={timelineItems}
      />
      <WeddingGallery galleryUrls={wedding.gallery_urls ?? []} />
      <WeddingRsvp weddingId={wedding.id} />

      <footer className="border-t border-border py-6 text-center font-body text-muted-foreground">
        Built with <Heart size={13} className="inline text-primary" /> Rello
      </footer>
    </main>
  );
};

export default WeddingWebsite;
