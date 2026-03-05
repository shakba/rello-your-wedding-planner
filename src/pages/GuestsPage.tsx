import { useEffect, useState } from "react";
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
import SidebarLayout from "@/components/SidebarLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Upload, Search, Trash2, Edit2, Check, X, Clock } from "lucide-react";

interface Guest {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  rsvp_status: string | null;
  plus_ones: number | null;
  group_id: string | null;
  meal_choice: string | null;
  allergies: string | null;
  notes: string | null;
  needs_transport: boolean | null;
}

interface GuestGroup {
  id: string;
  name: string;
}

const GuestsPage = () => {
  const { user } = useAuth();
  const [wedding, setWedding] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<GuestGroup[]>([]);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // New guest form
  const [newGuest, setNewGuest] = useState({
    full_name: "",
    phone: "",
    email: "",
    group_id: "",
    plus_ones: 0,
  });

  const loadData = async () => {
    if (!user) return;
    const { data: w } = await supabase
      .from("weddings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!w) return;
    setWedding(w);

    const { data: g } = await supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", w.id)
      .order("created_at", { ascending: false });
    setGuests(g || []);

    const { data: gr } = await supabase
      .from("guest_groups")
      .select("*")
      .eq("wedding_id", w.id)
      .order("name");
    setGroups(gr || []);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const addGuest = async () => {
    if (!wedding || !newGuest.full_name.trim()) return;
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      full_name: newGuest.full_name.trim(),
      phone: newGuest.phone || null,
      email: newGuest.email || null,
      group_id: newGuest.group_id || null,
      plus_ones: newGuest.plus_ones,
    });
    if (error) {
      toast.error("שגיאה בהוספת מוזמן");
    } else {
      toast.success("מוזמן נוסף בהצלחה!");
      setNewGuest({ full_name: "", phone: "", email: "", group_id: "", plus_ones: 0 });
      setIsAddOpen(false);
      loadData();
    }
  };

  const deleteGuest = async (id: string) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (!error) {
      toast.success("מוזמן נמחק");
      loadData();
    }
  };

  const addGroup = async () => {
    if (!wedding || !newGroupName.trim()) return;
    const { error } = await supabase.from("guest_groups").insert({
      wedding_id: wedding.id,
      name: newGroupName.trim(),
    });
    if (!error) {
      toast.success("קבוצה נוספה!");
      setNewGroupName("");
      setIsGroupOpen(false);
      loadData();
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !wedding) return;

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      toast.error("קובץ CSV ריק");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes("name") || h.includes("שם"));
    const phoneIdx = headers.findIndex((h) => h.includes("phone") || h.includes("טלפון"));
    const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("אימייל"));
    const groupIdx = headers.findIndex((h) => h.includes("group") || h.includes("קבוצה"));

    if (nameIdx === -1) {
      toast.error("חסרה עמודת שם בקובץ");
      return;
    }

    const guestsToInsert = [];
    const newGroups = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (!cols[nameIdx]) continue;
      const groupName = groupIdx >= 0 ? cols[groupIdx] : "";
      if (groupName) newGroups.add(groupName);
      guestsToInsert.push({
        full_name: cols[nameIdx],
        phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
        email: emailIdx >= 0 ? cols[emailIdx] || null : null,
        groupName,
      });
    }

    // Create new groups
    const groupMap: Record<string, string> = {};
    for (const g of groups) groupMap[g.name] = g.id;
    for (const gName of newGroups) {
      if (!groupMap[gName]) {
        const { data } = await supabase
          .from("guest_groups")
          .insert({ wedding_id: wedding.id, name: gName })
          .select()
          .single();
        if (data) groupMap[gName] = data.id;
      }
    }

    const inserts = guestsToInsert.map((g) => ({
      wedding_id: wedding.id,
      full_name: g.full_name,
      phone: g.phone,
      email: g.email,
      group_id: g.groupName ? groupMap[g.groupName] || null : null,
    }));

    const { error } = await supabase.from("guests").insert(inserts);
    if (error) {
      toast.error("שגיאה בהעלאת CSV");
    } else {
      toast.success(`${inserts.length} מוזמנים נוספו בהצלחה!`);
      loadData();
    }
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const csv = "שם,טלפון,אימייל,קבוצה\nישראל ישראלי,050-1234567,israel@email.com,משפחה\n";
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rello-guests-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredGuests = guests.filter((g) => {
    const matchSearch = g.full_name.includes(search) || g.phone?.includes(search) || g.email?.includes(search);
    const matchGroup = filterGroup === "all" || g.group_id === filterGroup;
    const matchStatus = filterStatus === "all" || g.rsvp_status === filterStatus;
    return matchSearch && matchGroup && matchStatus;
  });

  const getStatusBadge = (status: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      confirmed: { label: "אישר", className: "bg-sage-light text-sage" },
      declined: { label: "דחה", className: "bg-destructive/10 text-destructive" },
      pending: { label: "ממתין", className: "bg-secondary text-muted-foreground" },
      maybe: { label: "אולי", className: "bg-gold/10 text-gold" },
    };
    const c = config[status || "pending"] || config.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-body font-medium ${c.className}`}>
        {c.label}
      </span>
    );
  };

  const groupName = (groupId: string | null) => {
    if (!groupId) return "—";
    return groups.find((g) => g.id === groupId)?.name || "—";
  };

  return (
    <SidebarLayout variant="couple">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">ניהול מוזמנים</h1>
          <p className="text-muted-foreground font-body mt-1">
            {guests.length} מוזמנים ברשימה
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">+ קבוצה</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">הוספת קבוצה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body">שם הקבוצה</Label>
                  <Input
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="לדוגמה: חברים מהצבא"
                    className="font-body"
                  />
                </div>
                <Button variant="hero" onClick={addGroup} className="w-full">הוספה</Button>
              </div>
            </DialogContent>
          </Dialog>

          <label>
            <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
            <Button variant="outline" size="sm" asChild>
              <span><Upload size={16} /> העלאת CSV</span>
            </Button>
          </label>

          <Button variant="ghost" size="sm" onClick={downloadTemplate}>
            הורדת תבנית
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm">
                <UserPlus size={16} /> הוספת מוזמן
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">הוספת מוזמן</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body">שם מלא *</Label>
                  <Input
                    value={newGuest.full_name}
                    onChange={(e) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                    className="font-body"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">טלפון</Label>
                  <Input
                    value={newGuest.phone}
                    onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    dir="ltr"
                    className="font-body text-left"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">אימייל</Label>
                  <Input
                    value={newGuest.email}
                    onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    dir="ltr"
                    className="font-body text-left"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-body">קבוצה</Label>
                  <Select
                    value={newGuest.group_id}
                    onValueChange={(v) => setNewGuest({ ...newGuest, group_id: v })}
                  >
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="בחרו קבוצה" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body">מלווים</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newGuest.plus_ones}
                    onChange={(e) => setNewGuest({ ...newGuest, plus_ones: parseInt(e.target.value) || 0 })}
                    className="font-body"
                  />
                </div>
                <Button variant="hero" onClick={addGuest} className="w-full">הוספה</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש מוזמן..."
            className="font-body pr-10"
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-40 font-body">
            <SelectValue placeholder="כל הקבוצות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הקבוצות</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 font-body">
            <SelectValue placeholder="כל הסטטוסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="confirmed">אישרו</SelectItem>
            <SelectItem value="pending">ממתינים</SelectItem>
            <SelectItem value="declined">דחו</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guest Table */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground font-body">
              {guests.length === 0
                ? "עדיין אין מוזמנים. הוסיפו מוזמנים או העלו קובץ CSV."
                : "לא נמצאו מוזמנים לפי הסינון הנוכחי."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">שם</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">טלפון</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">קבוצה</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">סטטוס</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">מלווים</th>
                <th className="text-right p-4 font-body text-sm font-medium text-muted-foreground">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-body text-sm font-medium">{guest.full_name}</td>
                  <td className="p-4 font-body text-sm text-muted-foreground" dir="ltr">{guest.phone || "—"}</td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{groupName(guest.group_id)}</td>
                  <td className="p-4">{getStatusBadge(guest.rsvp_status)}</td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{guest.plus_ones || 0}</td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGuest(guest.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SidebarLayout>
  );
};

export default GuestsPage;
