import { useMemo } from "react";
import { CheckCircle2, Clock3, XCircle, UserMinus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VenueElement } from "./types";
import { Guest } from "@/types/wedding";
import { cn } from "@/lib/utils";

interface SeatingTableViewProps {
  elements: VenueElement[];
  guests: Guest[];
  assignments: Record<string, string>;
  onUnassign: (guestId: string) => void;
  onSelectElement: (id: string) => void;
}

const statusBadge: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  confirmed: { label: "מגיע", className: "bg-sage-light text-sage border-sage/20", icon: CheckCircle2 },
  pending: { label: "ממתין", className: "bg-accent/10 text-accent border-accent/20", icon: Clock3 },
  declined: { label: "לא מגיע", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const getGuestTotal = (guest: Guest) => 1 + Math.max(guest.plus_ones ?? 0, 0);

const SeatingTableView = ({ elements, guests, assignments, onUnassign, onSelectElement }: SeatingTableViewProps) => {
  const tables = useMemo(() => {
    return elements
      .filter((el) => el.type === "round-table" || el.type === "rect-table")
      .map((el) => {
        const seated = guests.filter((g) => assignments[g.id] === el.id);
        const seatedTotal = seated.reduce((sum, guest) => sum + getGuestTotal(guest), 0);
        return { ...el, seated, seatedTotal };
      });
  }, [elements, guests, assignments]);

  const unassigned = useMemo(() => {
    return guests.filter((g) => !assignments[g.id]);
  }, [guests, assignments]);

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <div
          key={table.id}
          className="rounded-2xl border border-border bg-card overflow-hidden shadow-card cursor-pointer"
          onClick={() => onSelectElement(table.id)}
        >
          <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{table.type === "round-table" ? "⭕" : "▬"}</span>
              <h4 className="font-display text-base font-bold text-foreground">{table.label}</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn(
                "text-xs",
                table.seatedTotal >= (table.capacity ?? 8) ? "border-destructive/40 text-destructive" : "border-sage/40 text-sage"
              )}>
                {table.seatedTotal} / {table.capacity ?? 8}
              </Badge>
            </div>
          </div>

          {table.seated.length === 0 ? (
            <p className="px-5 py-4 text-sm font-body text-muted-foreground">אין מוזמנים משובצים</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">סה״כ אורחים</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.seated.map((g) => {
                  const sb = statusBadge[g.rsvp_status ?? "pending"] ?? statusBadge.pending;
                  return (
                    <TableRow key={g.id}>
                      <TableCell className="font-body text-sm">{g.full_name}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-body", sb.className)}>
                          <sb.icon size={12} />
                          {sb.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-body">{getGuestTotal(g)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onUnassign(g.id); }}>
                          <UserMinus size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      ))}

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 overflow-hidden">
          <div className="border-b border-border bg-secondary/20 px-5 py-3">
            <h4 className="font-display text-base font-bold text-muted-foreground">
              לא שובצו ({unassigned.length})
            </h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם</TableHead>
                <TableHead className="text-right">סטטוס</TableHead>
                <TableHead className="text-right">סה״כ אורחים</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassigned.map((g) => {
                const sb = statusBadge[g.rsvp_status ?? "pending"] ?? statusBadge.pending;
                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-body text-sm">{g.full_name}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-body", sb.className)}>
                        <sb.icon size={12} />
                        {sb.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-body">{getGuestTotal(g)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SeatingTableView;
