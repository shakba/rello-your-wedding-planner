import { useMemo, useState } from "react";
import { Search, UserPlus, X, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Guest } from "@/types/wedding";
import { cn } from "@/lib/utils";

type RsvpFilter = "all" | "confirmed" | "pending" | "declined";

interface GuestAssignPanelProps {
  guests: Guest[];
  assignments: Record<string, string>; // guestId -> elementId
  selectedElementId: string | null;
  selectedElementLabel: string;
  onAssign: (guestId: string, elementId: string) => void;
  onUnassign: (guestId: string) => void;
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  confirmed: { label: "אישר", icon: CheckCircle2, className: "text-sage" },
  pending: { label: "ממתין", icon: Clock3, className: "text-accent" },
  declined: { label: "דחה", icon: XCircle, className: "text-destructive" },
};

const getGuestTotal = (guest: Guest) => 1 + Math.max(guest.plus_ones ?? 0, 0);

const GuestAssignPanel = ({
  guests,
  assignments,
  selectedElementId,
  selectedElementLabel,
  onAssign,
  onUnassign,
}: GuestAssignPanelProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RsvpFilter>("all");

  const unassignedGuests = useMemo(() => {
    return guests.filter((g) => {
      if (assignments[g.id]) return false;
      if (filter !== "all" && (g.rsvp_status ?? "pending") !== filter) return false;
      if (search && !g.full_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [guests, assignments, filter, search]);

  const assignedToSelected = useMemo(() => {
    if (!selectedElementId) return [];
    return guests.filter((g) => assignments[g.id] === selectedElementId);
  }, [guests, assignments, selectedElementId]);

  const assignedToSelectedTotal = useMemo(() => {
    return assignedToSelected.reduce((sum, guest) => sum + getGuestTotal(guest), 0);
  }, [assignedToSelected]);

  const filters: { value: RsvpFilter; label: string; count: number }[] = useMemo(() => {
    const unassigned = guests.filter((g) => !assignments[g.id]);
    return [
      { value: "all", label: "הכל", count: unassigned.length },
      { value: "confirmed", label: "מגיעים", count: unassigned.filter((g) => g.rsvp_status === "confirmed").length },
      { value: "pending", label: "ממתינים", count: unassigned.filter((g) => (g.rsvp_status ?? "pending") === "pending").length },
      { value: "declined", label: "לא מגיעים", count: unassigned.filter((g) => g.rsvp_status === "declined").length },
    ];
  }, [guests, assignments]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-card">
      <div className="border-b border-border p-4">
        <h3 className="font-display text-lg font-bold text-foreground">מוזמנים</h3>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-body transition-colors",
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <div className="relative mt-3">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש מוזמן..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pr-9 text-sm"
          />
        </div>
      </div>

      {/* Assigned to selected table */}
      {selectedElementId && (
        <div className="border-b border-border p-3 bg-primary/5">
          <p className="mb-2 text-xs font-body font-semibold text-primary">
            יושבים ב{selectedElementLabel} ({assignedToSelected.length} משקי בית / {assignedToSelectedTotal} אורחים)
          </p>
          {assignedToSelected.length === 0 ? (
            <p className="text-xs font-body text-muted-foreground">גררו מוזמנים לכאן</p>
          ) : (
            <div className="space-y-1">
              {assignedToSelected.map((g) => {
                const sc = statusConfig[g.rsvp_status ?? "pending"] ?? statusConfig.pending;
                return (
                  <div key={g.id} className="flex items-center justify-between rounded-lg bg-card px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <sc.icon size={12} className={sc.className} />
                      <span className="text-xs font-body text-foreground">{g.full_name}</span>
                      <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{getGuestTotal(g)}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onUnassign(g.id)}>
                      <X size={12} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Unassigned guests */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-1">
          {unassignedGuests.map((g) => {
            const sc = statusConfig[g.rsvp_status ?? "pending"] ?? statusConfig.pending;
            return (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60"
              >
                <div className="flex items-center gap-1.5">
                  <sc.icon size={12} className={sc.className} />
                  <span className="text-xs font-body text-foreground">{g.full_name}</span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{getGuestTotal(g)}</Badge>
                </div>
                {selectedElementId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-primary"
                    onClick={() => onAssign(g.id, selectedElementId)}
                  >
                    <UserPlus size={13} />
                  </Button>
                )}
              </div>
            );
          })}
          {unassignedGuests.length === 0 && (
            <p className="py-8 text-center text-xs font-body text-muted-foreground">
              {search ? "לא נמצאו תוצאות" : "כל המוזמנים שובצו 🎉"}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GuestAssignPanel;
