import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Shirt, Heart, Search } from "lucide-react";
import { toast } from "sonner";

const WeddingWebsite = () => {
  const { slug } = useParams();
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpName, setRsvpName] = useState("");
  const [foundGuest, setFoundGuest] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [plusOnes, setPlusOnes] = useState(0);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("weddings")
      .select("*")
      .eq("website_slug", slug)
      .eq("website_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setWedding(data);
        setLoading(false);
      });
  }, [slug]);

  const searchGuest = async () => {
    if (!rsvpName.trim() || !wedding) return;
    setSearching(true);
    const { data } = await supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .ilike("full_name", `%${rsvpName.trim()}%`);

    if (data && data.length > 0) {
      setFoundGuest(data[0]);
      setPlusOnes(data[0].plus_ones || 0);
    } else {
      toast.error("לא נמצא מוזמן בשם הזה");
      setFoundGuest(null);
    }
    setSearching(false);
  };

  const confirmRSVP = async (status: "confirmed" | "declined") => {
    if (!foundGuest) return;
    const { error } = await supabase
      .from("guests")
      .update({
        rsvp_status: status,
        plus_ones: plusOnes,
        rsvp_answered_at: new Date().toISOString(),
      })
      .eq("id", foundGuest.id);

    if (!error) {
      toast.success(status === "confirmed" ? "אישור הגעה נרשם! 🎉" : "התשובה נרשמה, מקווים שתשנו דעה!");
      setFoundGuest({ ...foundGuest, rsvp_status: status });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">האתר לא נמצא</h1>
          <p className="text-muted-foreground font-body">ייתכן שהאתר לא פורסם עדיין.</p>
        </div>
      </div>
    );
  }

  const weddingDate = wedding.wedding_date
    ? new Date(wedding.wedding_date).toLocaleDateString("he-IL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="min-h-[70vh] flex items-center justify-center bg-gradient-warm relative">
        <div className="text-center px-4">
          <p className="text-primary font-body text-sm font-semibold mb-4">מוזמנים לחגוג איתנו</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
            {wedding.partner1_name} & {wedding.partner2_name}
          </h1>
          {weddingDate && (
            <p className="text-xl text-muted-foreground font-body flex items-center justify-center gap-2">
              <Calendar size={20} />
              {weddingDate}
            </p>
          )}
        </div>
      </section>

      {/* Story */}
      {wedding.story && (
        <section className="py-20 container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-display font-bold mb-6">הסיפור שלנו</h2>
          <p className="text-muted-foreground font-body leading-relaxed whitespace-pre-line">{wedding.story}</p>
        </section>
      )}

      {/* Venue */}
      {wedding.venue_name && (
        <section className="py-16 bg-gradient-warm">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-6">מקום האירוע</h2>
            <div className="flex items-center justify-center gap-2 text-lg font-body mb-2">
              <MapPin size={20} className="text-primary" />
              <span className="font-medium">{wedding.venue_name}</span>
            </div>
            {wedding.venue_address && (
              <p className="text-muted-foreground font-body mb-4">{wedding.venue_address}</p>
            )}
            {wedding.venue_address && (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.venue_address)}`}
                    target="_blank"
                  >
                    Google Maps
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.waze.com/ul?q=${encodeURIComponent(wedding.venue_address)}`}
                    target="_blank"
                  >
                    Waze
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Dress Code */}
      {wedding.dress_code && (
        <section className="py-16 container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shirt size={20} className="text-primary" />
            <h2 className="text-2xl font-display font-bold">קוד לבוש</h2>
          </div>
          <p className="text-lg text-muted-foreground font-body">{wedding.dress_code}</p>
        </section>
      )}

      {/* RSVP */}
      <section className="py-20 bg-gradient-warm">
        <div className="container mx-auto px-4 max-w-md text-center">
          <Heart size={32} className="text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold mb-2">אישור הגעה</h2>
          <p className="text-muted-foreground font-body mb-8">חפשו את השם שלכם ואשרו הגעה</p>

          {!foundGuest ? (
            <div className="flex gap-2">
              <Input
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="הקלידו את השם שלכם"
                className="font-body"
                onKeyDown={(e) => e.key === "Enter" && searchGuest()}
              />
              <Button variant="hero" onClick={searchGuest} disabled={searching}>
                <Search size={18} />
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-right">
              <p className="font-body text-lg font-medium mb-4">שלום {foundGuest.full_name}!</p>

              {foundGuest.rsvp_status === "confirmed" ? (
                <div className="text-center py-4">
                  <p className="text-sage font-body font-semibold text-lg">✅ אישרת הגעה!</p>
                  <p className="text-muted-foreground font-body text-sm mt-1">נתראה באירוע 🎉</p>
                </div>
              ) : foundGuest.rsvp_status === "declined" ? (
                <div className="text-center py-4">
                  <p className="text-destructive font-body font-semibold">דחית את ההזמנה</p>
                  <Button variant="hero" size="sm" className="mt-3" onClick={() => confirmRSVP("confirmed")}>
                    שיניתי דעה, אני מגיע/ה!
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <label className="text-sm font-body text-muted-foreground">כמה מלווים?</label>
                      <Input
                        type="number"
                        min={0}
                        value={plusOnes}
                        onChange={(e) => setPlusOnes(parseInt(e.target.value) || 0)}
                        className="font-body"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="hero" className="flex-1" onClick={() => confirmRSVP("confirmed")}>
                      מגיע/ה! 🎉
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => confirmRSVP("declined")}>
                      לא מגיע/ה
                    </Button>
                  </div>
                </>
              )}

              <button
                className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
                onClick={() => {
                  setFoundGuest(null);
                  setRsvpName("");
                }}
              >
                חיפוש שם אחר
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-sm text-muted-foreground font-body">
          נבנה עם <Heart size={12} className="inline text-primary" /> באמצעות Rello
        </p>
      </footer>
    </div>
  );
};

export default WeddingWebsite;
