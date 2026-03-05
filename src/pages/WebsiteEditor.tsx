import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Eye, Globe } from "lucide-react";

const WebsiteEditor = () => {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("weddings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setWedding(data));
  }, [user]);

  const updateField = (field: string, value: any) => {
    setWedding((prev: any) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    if (!wedding) return;
    setSaving(true);
    const { error } = await supabase
      .from("weddings")
      .update({
        partner1_name: wedding.partner1_name,
        partner2_name: wedding.partner2_name,
        wedding_date: wedding.wedding_date,
        venue_name: wedding.venue_name,
        venue_address: wedding.venue_address,
        story: wedding.story,
        dress_code: wedding.dress_code,
        website_slug: wedding.website_slug,
        website_published: wedding.website_published,
      })
      .eq("id", wedding.id);

    setSaving(false);
    if (error) {
      toast.error("שגיאה בשמירה");
    } else {
      toast.success("נשמר בהצלחה!");
    }
  };

  if (!wedding) {
    return (
      <SidebarLayout variant="couple">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout variant="couple">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">אתר החתונה</h1>
          <p className="text-muted-foreground font-body mt-1">ערכו את התוכן שיופיע באתר</p>
        </div>
        <div className="flex gap-3">
          {wedding.website_slug && (
            <Button variant="outline" asChild>
              <a href={`/w/${wedding.website_slug}`} target="_blank">
                <Eye size={16} /> צפייה
              </a>
            </Button>
          )}
          <Button variant="hero" onClick={save} disabled={saving}>
            <Save size={16} /> {saving ? "שומר..." : "שמירה"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
            <h2 className="text-lg font-display font-semibold">פרטי הזוג</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body">שם בן/בת זוג 1</Label>
                <Input
                  value={wedding.partner1_name}
                  onChange={(e) => updateField("partner1_name", e.target.value)}
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body">שם בן/בת זוג 2</Label>
                <Input
                  value={wedding.partner2_name}
                  onChange={(e) => updateField("partner2_name", e.target.value)}
                  className="font-body"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-body">תאריך החתונה</Label>
              <Input
                type="date"
                value={wedding.wedding_date || ""}
                onChange={(e) => updateField("wedding_date", e.target.value)}
                dir="ltr"
                className="font-body text-left"
              />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
            <h2 className="text-lg font-display font-semibold">מקום האירוע</h2>
            <div className="space-y-2">
              <Label className="font-body">שם המקום</Label>
              <Input
                value={wedding.venue_name || ""}
                onChange={(e) => updateField("venue_name", e.target.value)}
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">כתובת</Label>
              <Input
                value={wedding.venue_address || ""}
                onChange={(e) => updateField("venue_address", e.target.value)}
                className="font-body"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
            <h2 className="text-lg font-display font-semibold">הגדרות אתר</h2>
            <div className="space-y-2">
              <Label className="font-body">כתובת האתר (slug)</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-body">/w/</span>
                <Input
                  value={wedding.website_slug || ""}
                  onChange={(e) => updateField("website_slug", e.target.value)}
                  dir="ltr"
                  className="font-body text-left"
                  placeholder="sarah-and-james"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-body">קוד לבוש</Label>
              <Input
                value={wedding.dress_code || ""}
                onChange={(e) => updateField("dress_code", e.target.value)}
                className="font-body"
                placeholder="אלגנטי"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={wedding.website_published || false}
                onChange={(e) => updateField("website_published", e.target.checked)}
                className="w-4 h-4"
              />
              <Label className="font-body">פרסם את האתר</Label>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4">
            <h2 className="text-lg font-display font-semibold">הסיפור שלנו</h2>
            <Textarea
              value={wedding.story || ""}
              onChange={(e) => updateField("story", e.target.value)}
              className="font-body min-h-[150px]"
              placeholder="ספרו את הסיפור שלכם..."
            />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default WebsiteEditor;
