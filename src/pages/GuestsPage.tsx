import { useEffect, useMemo, useState } from "react";
import { UserPlus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Guest, GuestGroup } from "@/types/wedding";
import CsvImportDialog from "@/components/guests/CsvImportDialog";

const STATUS_LABELS: Record<string, string> = {
  confirmed: "אישר/ה",
  pending: "ממתין/ה",
  declined: "דחה/תה",
};

const getGuestTotal = (guest: Guest) => 1 + Math.max(guest.plus_ones ?? 0, 0);

const GuestsPage = () => {
  const { user } = useAuth();
  const { wedding, loading: weddingLoading, ensureWedding } = useWedding(user?.id);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<GuestGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newGuest, setNewGuest] = useState({
    full_name: "", phone: "", email: "", total_guests: 1, group_id: "none",
  });

  const loadGuests = async () => {
    if (!wedding?.id) { setGuests([]); setGroups([]); setLoading(false); return; }
    setLoading(true);
    const [guestRes, groupRes] = await Promise.all([
      supabase.from("guests").select("*").eq("wedding_id", wedding.id).order("created_at", { ascending: false }),
      supabase.from("guest_groups").select("*").eq("wedding_id", wedding.id).order("name"),
    ]);
    if (guestRes.error) toast.error("לא הצלחנו לטעון את רשימת המוזמנים");
    else setGuests(guestRes.data ?? []);
    if (!groupRes.error) setGroups(groupRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id || weddingLoading || wedding) return;
    void ensureWedding();
  }, [user?.id, weddingLoading, wedding, ensureWedding]);

  useEffect(() => { void loadGuests(); }, [wedding?.id]);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    return guests.filter((g) => {
      const text = [g.full_name, g.phone ?? "", g.email ?? ""].join(" ").toLowerCase();
      const matchesSearch = q.length === 0 || text.includes(q);
      const matchesStatus = statusFilter === "all" || (g.rsvp_status ?? "pending") === statusFilter;
      const matchesGroup = groupFilter === "all"
        ? true
        : groupFilter === "none"
          ? !g.group_id
          : g.group_id === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [guests, search, statusFilter, groupFilter]);

  const addGuest = async () => {
    if (!wedding?.id || !newGuest.full_name.trim()) { toast.error("יש להזין שם מלא"); return; }
    const { error } = await supabase.from("guests").insert({
      wedding_id: wedding.id,
      full_name: newGuest.full_name.trim(),
      phone: newGuest.phone.trim() || null,
      email: newGuest.email.trim() || null,
      plus_ones: Math.max(newGuest.total_guests - 1, 0),
      group_id: newGuest.group_id === "none" ? null : newGuest.group_id,
    });
    if (error) { toast.error("לא הצלחנו להוסיף מוזמן"); return; }
    toast.success("המוזמן נוסף בהצלחה");
    setNewGuest({ full_name: "", phone: "", email: "", total_guests: 1, group_id: "none" });
    setIsAddOpen(false);
    void loadGuests();
  };

  const deleteGuest = async (id: string) => {
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) { toast.error("לא הצלחנו למחוק את המוזמן"); return; }
    toast.success("המוזמן נמחק");
    void loadGuests();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("guests").update({
      rsvp_status: status,
      rsvp_answered_at: status === "pending" ? null : new Date().toISOString(),
    }).eq("id", id);
    if (error) { toast.error("לא הצלחנו לעדכן סטטוס"); return; }
    setGuests((cur) => cur.map((g) => g.id === id ? { ...g, rsvp_status: status, rsvp_answered_at: status === "pending" ? null : new Date().toISOString() } : g));
  };

  const stats = useMemo(() => {
    const total = guests.reduce((sum, g) => sum + getGuestTotal(g), 0);
    const confirmed = guests
      .filter((g) => g.rsvp_status === "confirmed")
      .reduce((sum, g) => sum + getGuestTotal(g), 0);
    const declined = guests
      .filter((g) => g.rsvp_status === "declined")
      .reduce((sum, g) => sum + getGuestTotal(g), 0);
    const pending = guests
      .filter((g) => (g.rsvp_status ?? "pending") === "pending")
      .reduce((sum, g) => sum + getGuestTotal(g), 0);

    return {
      total,
      confirmed,
      declined,
      pending,
      households: guests.length,
    };
  }, [guests]);

  return (
    <SidebarLayout variant="couple">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-bold">ניהול מוזמנים</h1>
          <p className="mt-2 text-xl font-body text-muted-foreground">נהלו את כל רשימת המוזמנים במקום אחד.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {wedding?.id && (
            <CsvImportDialog
              weddingId={wedding.id}
              existingGroups={groups}
              onImportDone={loadGuests}
            />
          )}

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button variant="hero"><UserPlus size={18} /> הוספת מוזמן</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display text-2xl">הוספת מוזמן חדש</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-body">שם מלא *</Label>
                  <Input value={newGuest.full_name} onChange={(e) => setNewGuest((p) => ({ ...p, full_name: e.target.value }))} className="font-body" />
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-body">טלפון</Label>
                    <Input value={newGuest.phone} onChange={(e) => setNewGuest((p) => ({ ...p, phone: e.target.value }))} className="font-body" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body">אימייל</Label>
                    <Input value={newGuest.email} onChange={(e) => setNewGuest((p) => ({ ...p, email: e.target.value }))} className="font-body" type="email" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="font-body">קבוצה</Label>
                    <Select value={newGuest.group_id} onValueChange={(v) => setNewGuest((p) => ({ ...p, group_id: v }))}>
                      <SelectTrigger className="font-body"><SelectValue placeholder="ללא קבוצה" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ללא קבוצה</SelectItem>
                        {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body">סה״כ אורחים לרשומה</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newGuest.total_guests}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setNewGuest((p) => ({ ...p, total_guests: Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1 }));
                      }}
                      className="font-body"
                    />
                  </div>
                </div>
                <Button className="w-full" variant="hero" onClick={addGuest}>שמירת מוזמן</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: "סה״כ אורחים", value: stats.total },
          { label: "אישרו", value: stats.confirmed },
          { label: "ממתינים", value: stats.pending },
          { label: "דחו", value: stats.declined },
          { label: "משקי בית", value: stats.households },
        ].map((item) => (
          <article key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <p className="font-body text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-4xl font-display font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      {/* Group filter chips */}
      {groups.length > 0 && (
        <section className="mt-4 flex flex-wrap gap-2">
          <Badge
            variant={groupFilter === "all" ? "default" : "outline"}
            className="cursor-pointer font-body transition-colors"
            onClick={() => setGroupFilter("all")}
          >
            כל הקבוצות ({guests.length})
          </Badge>
          {groups.map((g) => {
            const count = guests.filter((guest) => guest.group_id === g.id).length;
            return (
              <Badge
                key={g.id}
                variant={groupFilter === g.id ? "default" : "outline"}
                className="cursor-pointer font-body transition-colors"
                onClick={() => setGroupFilter(groupFilter === g.id ? "all" : g.id)}
              >
                {g.name} ({count})
              </Badge>
            );
          })}
          <Badge
            variant={groupFilter === "none" ? "default" : "outline"}
            className="cursor-pointer font-body transition-colors"
            onClick={() => setGroupFilter(groupFilter === "none" ? "all" : "none")}
          >
            ללא קבוצה ({guests.filter((g) => !g.group_id).length})
          </Badge>
        </section>
      )}

      {/* Table */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי שם / טלפון / אימייל" className="pr-10 font-body" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 font-body"><SelectValue placeholder="כל הסטטוסים" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="confirmed">אישרו</SelectItem>
              <SelectItem value="pending">ממתינים</SelectItem>
              <SelectItem value="declined">דחו</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading || weddingLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-14 text-center font-body text-muted-foreground">
            {guests.length === 0
              ? "אין מוזמנים עדיין. הוסיפו מוזמנים ידנית או ייבאו מקובץ CSV."
              : "לא נמצאו מוזמנים לפי הסינון הנוכחי."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-border text-right font-body text-sm text-muted-foreground">
                  <th className="px-3 py-3">שם</th>
                  <th className="px-3 py-3">טלפון</th>
                  <th className="px-3 py-3">קבוצה</th>
                  <th className="px-3 py-3">סטטוס</th>
                  <th className="px-3 py-3">סה״כ אורחים</th>
                  <th className="px-3 py-3">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b border-border/70 font-body text-sm">
                    <td className="px-3 py-3 font-medium text-foreground">{guest.full_name}</td>
                    <td className="px-3 py-3 text-muted-foreground" dir="ltr">{guest.phone || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{groups.find((g) => g.id === guest.group_id)?.name ?? "—"}</td>
                    <td className="px-3 py-3">
                      <Select value={guest.rsvp_status ?? "pending"} onValueChange={(v) => void updateStatus(guest.id, v)}>
                        <SelectTrigger className="w-36 font-body"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{getGuestTotal(guest)}</td>
                    <td className="px-3 py-3">
                      <Button variant="ghost" size="icon" onClick={() => void deleteGuest(guest.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
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

export default GuestsPage;

