import { useEffect, useState } from "react";
import { Eye, Save } from "lucide-react";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import GalleryUpload from "@/components/wedding-site/GalleryUpload";

interface WebsiteFormValues {
  partner1_name: string;
  partner2_name: string;
  wedding_date: string;
  venue_name: string;
  venue_address: string;
  story: string;
  dress_code: string;
  website_slug: string;
  website_published: boolean;
  parent1_parents: string;
  parent2_parents: string;
  event_time: string;
  schedule_text: string;
}

const EMPTY_FORM: WebsiteFormValues = {
  partner1_name: "",
  partner2_name: "",
  wedding_date: "",
  venue_name: "",
  venue_address: "",
  story: "",
  dress_code: "",
  website_slug: "",
  website_published: false,
  parent1_parents: "",
  parent2_parents: "",
  event_time: "",
  schedule_text: "",
};

const normalizeSlug = (v: string) => v.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");

const formatSchedule = (schedule: unknown): string => {
  if (!Array.isArray(schedule)) return "";
  return schedule
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      const time = "time" in item && typeof item.time === "string" ? item.time.trim() : "";
      const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
      return time && title ? `${time} - ${title}` : "";
    })
    .filter(Boolean)
    .join("\n");
};

const parseSchedule = (value: string): { time: string; title: string }[] | null => {
  const rows = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [time, ...rest] = line.split("-");
      const title = rest.join("-").trim();
      return { time: time?.trim() ?? "", title };
    })
    .filter((item) => item.time && item.title);

  return rows.length > 0 ? rows : null;
};

const WebsiteEditor = () => {
  const { user } = useAuth();
  const { wedding, loading: weddingLoading, ensureWedding, reload, setWedding } = useWedding(user?.id);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<WebsiteFormValues>(EMPTY_FORM);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id || weddingLoading || wedding) return;
    void ensureWedding();
  }, [user?.id, weddingLoading, wedding, ensureWedding]);

  useEffect(() => {
    if (!wedding) { setValues(EMPTY_FORM); setGalleryUrls([]); return; }
    setValues({
      partner1_name: wedding.partner1_name ?? "",
      partner2_name: wedding.partner2_name ?? "",
      wedding_date: wedding.wedding_date ?? "",
      venue_name: wedding.venue_name ?? "",
      venue_address: wedding.venue_address ?? "",
      story: wedding.story ?? "",
      dress_code: wedding.dress_code ?? "",
      website_slug: wedding.website_slug ?? "",
      website_published: wedding.website_published ?? false,
      parent1_parents: wedding.parent1_parents ?? "",
      parent2_parents: wedding.parent2_parents ?? "",
      event_time: wedding.event_time ?? "",
      schedule_text: formatSchedule(wedding.schedule),
    });
    setGalleryUrls(wedding.gallery_urls ?? []);
  }, [wedding]);

  const up = <K extends keyof WebsiteFormValues>(k: K, v: WebsiteFormValues[K]) => setValues((c) => ({ ...c, [k]: v }));

  const saveChanges = async () => {
    if (!wedding?.id) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("weddings").update({
        partner1_name: values.partner1_name.trim(),
        partner2_name: values.partner2_name.trim(),
        wedding_date: values.wedding_date || null,
        venue_name: values.venue_name.trim() || null,
        venue_address: values.venue_address.trim() || null,
        story: values.story.trim() || null,
        dress_code: values.dress_code.trim() || null,
        website_slug: normalizeSlug(values.website_slug) || null,
        website_published: values.website_published,
        parent1_parents: values.parent1_parents.trim() || null,
        parent2_parents: values.parent2_parents.trim() || null,
        event_time: values.event_time.trim() || null,
        schedule: parseSchedule(values.schedule_text),
      }).eq("id", wedding.id);
      if (error) { toast.error("לא הצלחנו לשמור את השינויים"); return; }
      toast.success("האתר עודכן בהצלחה");
      void reload();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpdate = (urls: string[]) => {
    setGalleryUrls(urls);
    if (wedding) {
      setWedding({ ...wedding, gallery_urls: urls });
    }
  };

  if (weddingLoading || !wedding) {
    return (
      <SidebarLayout variant="couple">
        <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-16 shadow-card">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout variant="couple">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold">עורך אתר החתונה</h1>
          <p className="mt-2 text-xl font-body text-muted-foreground">עדכנו את כל פרטי אתר החתונה במקום אחד.</p>
        </div>
        <div className="flex items-center gap-2">
          {values.website_slug && (
            <Button variant="outline" asChild>
              <a href={`/w/${normalizeSlug(values.website_slug)}`} target="_blank" rel="noreferrer"><Eye size={16} /> תצוגה מקדימה</a>
            </Button>
          )}
          <Button variant="hero" onClick={saveChanges} disabled={saving}><Save size={16} /> {saving ? "שומר..." : "שמירה"}</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Couple details */}
        <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-3xl font-display font-bold">פרטי הזוג</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label className="font-body">שם בן/בת זוג 1</Label><Input value={values.partner1_name} onChange={(e) => up("partner1_name", e.target.value)} className="font-body" /></div>
            <div className="space-y-2"><Label className="font-body">שם בן/בת זוג 2</Label><Input value={values.partner2_name} onChange={(e) => up("partner2_name", e.target.value)} className="font-body" /></div>
            <div className="space-y-2"><Label className="font-body">הורי החתן</Label><Input value={values.parent1_parents} onChange={(e) => up("parent1_parents", e.target.value)} className="font-body" placeholder="לדוגמה: משה ושושנה כהן" /></div>
            <div className="space-y-2"><Label className="font-body">הורי הכלה</Label><Input value={values.parent2_parents} onChange={(e) => up("parent2_parents", e.target.value)} className="font-body" placeholder="לדוגמה: דוד ורחל לוי" /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label className="font-body">תאריך החתונה</Label><Input type="date" value={values.wedding_date} onChange={(e) => up("wedding_date", e.target.value)} dir="ltr" className="text-left font-body" /></div>
            <div className="space-y-2"><Label className="font-body">שעת תחילת האירוע</Label><Input type="time" value={values.event_time} onChange={(e) => up("event_time", e.target.value)} dir="ltr" className="text-left font-body" /></div>
          </div>
          <div className="space-y-2"><Label className="font-body">הסיפור שלכם</Label><Textarea value={values.story} onChange={(e) => up("story", e.target.value)} className="min-h-[180px] font-body" placeholder="ספרו לאורחים קצת על הדרך שלכם..." /></div>
        </section>

        {/* Event details & publish */}
        <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-3xl font-display font-bold">פרטי אירוע ופרסום</h2>
          <div className="space-y-2"><Label className="font-body">שם מקום האירוע</Label><Input value={values.venue_name} onChange={(e) => up("venue_name", e.target.value)} className="font-body" /></div>
          <div className="space-y-2"><Label className="font-body">כתובת מלאה</Label><Input value={values.venue_address} onChange={(e) => up("venue_address", e.target.value)} className="font-body" /></div>
          <div className="space-y-2"><Label className="font-body">קוד לבוש</Label><Input value={values.dress_code} onChange={(e) => up("dress_code", e.target.value)} className="font-body" placeholder="למשל: קלאסי אלגנט" /></div>
          <div className="space-y-2">
            <Label className="font-body">לו"ז האירוע</Label>
            <Textarea
              value={values.schedule_text}
              onChange={(e) => up("schedule_text", e.target.value)}
              className="min-h-[140px] font-body"
              placeholder={"כל שורה בפורמט: שעה - כותרת\n18:00 - קבלת פנים\n19:00 - חופה\n20:00 - ארוחת ערב"}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body">כתובת אתר</Label>
            <div className="flex items-center gap-2" dir="ltr"><span className="font-body text-muted-foreground">/w/</span><Input value={values.website_slug} onChange={(e) => up("website_slug", normalizeSlug(e.target.value))} className="text-left font-body" placeholder="sarah-and-james" /></div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 p-4">
            <div><p className="font-body font-semibold">פרסום האתר</p><p className="text-sm font-body text-muted-foreground">כאשר פעיל, האורחים יוכלו לגשת לעמוד החתונה.</p></div>
            <Switch checked={values.website_published} onCheckedChange={(c) => up("website_published", c)} />
          </div>
        </section>
      </div>

      {/* Gallery section */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
        <GalleryUpload
          weddingId={wedding.id}
          galleryUrls={galleryUrls}
          onUpdate={handleGalleryUpdate}
        />
      </section>
    </SidebarLayout>
  );
};

export default WebsiteEditor;
