import { useState } from "react";
import { Heart, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface RsvpGuest {
  id: string;
  full_name: string;
  plus_ones: number | null;
  rsvp_status: string | null;
}

interface WeddingRsvpProps {
  weddingId: string;
}

const WeddingRsvp = ({ weddingId }: WeddingRsvpProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guest, setGuest] = useState<RsvpGuest | null>(null);
  const [plusOnes, setPlusOnes] = useState(0);

  const searchGuest = async () => {
    const query = searchValue.trim();
    if (!query) return;

    setSearching(true);
    const { data, error } = await supabase
      .from("guests")
      .select("id, full_name, plus_ones, rsvp_status")
      .eq("wedding_id", weddingId)
      .ilike("full_name", `%${query}%`)
      .limit(1);

    setSearching(false);

    if (error || !data || data.length === 0) {
      toast.error("לא מצאנו את השם הזה ברשימה");
      setGuest(null);
      return;
    }

    setGuest(data[0]);
    setPlusOnes(Math.max(data[0].plus_ones ?? 0, 0));
  };

  const submitRsvp = async (status: "confirmed" | "declined") => {
    if (!guest) return;

    setSaving(true);
    const { error } = await supabase
      .from("guests")
      .update({
        rsvp_status: status,
        plus_ones: Math.max(plusOnes, 0),
        rsvp_answered_at: new Date().toISOString(),
      })
      .eq("id", guest.id);

    setSaving(false);

    if (error) {
      toast.error("לא הצלחנו לשמור כרגע, נסו שוב");
      return;
    }

    setGuest({ ...guest, rsvp_status: status, plus_ones: Math.max(plusOnes, 0) });
    toast.success(status === "confirmed" ? "האישור נשמר בהצלחה" : "עדכנו שלא תוכלו להגיע");
  };

  return (
    <section className="border-t border-border bg-secondary/40 py-16">
      <div className="container mx-auto max-w-xl px-4">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <Heart size={30} className="mx-auto text-primary" />
          <h2 className="mt-3 text-3xl font-display font-bold">אישור הגעה</h2>
          <p className="mt-1 font-body text-muted-foreground">הקלידו שם ואשרו הגעה</p>

          {!guest ? (
            <div className="mt-6 flex gap-2">
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && searchGuest()}
                placeholder="למשל: ישראל ישראלי"
                className="font-body"
              />
              <Button variant="hero" onClick={searchGuest} disabled={searching}>
                <Search size={16} />
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-5 text-right">
              <p className="text-lg font-body font-semibold">שלום {guest.full_name}</p>

              {guest.rsvp_status === "confirmed" ? (
                <p className="rounded-xl bg-sage-light px-4 py-3 text-center font-body font-semibold text-sage">
                  מעולה! אישרת הגעה 💚
                </p>
              ) : guest.rsvp_status === "declined" ? (
                <p className="rounded-xl bg-destructive/10 px-4 py-3 text-center font-body font-semibold text-destructive">
                  קיבלנו את העדכון שלא תוכלו להגיע
                </p>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-body text-muted-foreground">סה״כ אורחים</label>
                <Input
                  type="number"
                  min={1}
                  value={plusOnes + 1}
                  onChange={(event) => setPlusOnes(Math.max((Number(event.target.value) || 1) - 1, 0))}
                  className="font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="hero" onClick={() => submitRsvp("confirmed")} disabled={saving}>
                  מגיע/ה 🎉
                </Button>
                <Button variant="outline" onClick={() => submitRsvp("declined")} disabled={saving}>
                  לא מגיע/ה
                </Button>
              </div>

              <button
                type="button"
                className="mx-auto block text-sm font-body text-muted-foreground transition-colors hover:text-primary"
                onClick={() => {
                  setGuest(null);
                  setSearchValue("");
                }}
              >
                חיפוש שם אחר
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WeddingRsvp;
