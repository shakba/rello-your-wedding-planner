import { useCallback, useEffect, useMemo, useState } from "react";
import { Map, TableProperties, Save } from "lucide-react";
import SidebarLayout from "@/components/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useWedding } from "@/hooks/useWedding";
import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types/wedding";
import { VenueElement, VenueElementType, ELEMENT_PRESETS } from "@/components/seating/types";
import SeatingCanvas from "@/components/seating/SeatingCanvas";
import ElementPalette from "@/components/seating/ElementPalette";
import ElementSettings from "@/components/seating/ElementSettings";
import GuestAssignPanel from "@/components/seating/GuestAssignPanel";
import SeatingTableView from "@/components/seating/SeatingTableView";
import { toast } from "sonner";

const getGuestTotal = (guest: Guest) => 1 + Math.max(guest.plus_ones ?? 0, 0);

const SeatingPage = () => {
  const { user } = useAuth();
  const { wedding, loading: weddingLoading } = useWedding(user?.id);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [elements, setElements] = useState<VenueElement[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // guestId -> elementId
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("canvas");

  // Load guests
  useEffect(() => {
    if (!wedding?.id) return;
    supabase
      .from("guests")
      .select("*")
      .eq("wedding_id", wedding.id)
      .then(({ data }) => setGuests(data ?? []));
  }, [wedding?.id]);

  // Load seating tables & reconstruct elements + assignments
  useEffect(() => {
    if (!wedding?.id) return;
    supabase
      .from("seating_tables")
      .select("*")
      .eq("wedding_id", wedding.id)
      .then(({ data }) => {
        if (!data || data.length === 0) return;

        const loadedElements: VenueElement[] = data.map((t) => {
          // Try to parse extra data from table_name JSON prefix
          let meta: any = {};
          try {
            if (t.table_name.startsWith("{")) {
              meta = JSON.parse(t.table_name);
            }
          } catch {}

          return {
            id: t.id,
            type: (meta.type as VenueElementType) || "round-table",
            label: meta.label || t.table_name,
            x: t.position_x ?? 0,
            y: t.position_y ?? 0,
            width: meta.width || 90,
            height: meta.height || 90,
            capacity: t.capacity,
            rotation: meta.rotation || 0,
            tableId: t.id,
          };
        });
        setElements(loadedElements);
      });

    // Load assignments from guests' table_number -> we'll use a different approach
    // We store assignments in guest.table_number as index reference
    // Actually, let's use guest.notes field temporarily or a localStorage approach
    // Better: use guest.group_id or a dedicated approach. For now, localStorage per wedding.
    const stored = localStorage.getItem(`seating-assignments-${wedding.id}`);
    if (stored) {
      try { setAssignments(JSON.parse(stored)); } catch {}
    }
  }, [wedding?.id]);

  // Auto-save assignments to localStorage
  useEffect(() => {
    if (!wedding?.id) return;
    localStorage.setItem(`seating-assignments-${wedding.id}`, JSON.stringify(assignments));
  }, [assignments, wedding?.id]);

  const addElement = useCallback((type: VenueElementType) => {
    const preset = ELEMENT_PRESETS[type];
    const count = elements.filter((e) => e.type === type).length + 1;
    const newEl: VenueElement = {
      id: crypto.randomUUID(),
      type,
      label: `${preset.label} ${count}`,
      x: 200 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      width: preset.width,
      height: preset.height,
      capacity: preset.capacity,
      rotation: 0,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [elements]);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, x, y } : e)));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<VenueElement>) => {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    setAssignments((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((gId) => { if (next[gId] === id) delete next[gId]; });
      return next;
    });
    setSelectedId(null);
  }, []);

  const assignGuest = useCallback((guestId: string, elementId: string) => {
    setAssignments((prev) => ({ ...prev, [guestId]: elementId }));
  }, []);

  const unassignGuest = useCallback((guestId: string) => {
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[guestId];
      return next;
    });
  }, []);

  const getAssignedCount = useCallback(
    (elementId: string) => Object.entries(assignments)
      .filter(([, eId]) => eId === elementId)
      .reduce((sum, [guestId]) => {
        const guest = guests.find((g) => g.id === guestId);
        return sum + (guest ? getGuestTotal(guest) : 0);
      }, 0),
    [assignments, guests]
  );

  const selectedElement = useMemo(() => elements.find((e) => e.id === selectedId) ?? null, [elements, selectedId]);

  // Save to DB
  const saveLayout = useCallback(async () => {
    if (!wedding?.id) return;
    setSaving(true);
    try {
      // Delete existing seating tables for this wedding
      await supabase.from("seating_tables").delete().eq("wedding_id", wedding.id);

      // Insert all elements as seating_tables (tables and non-tables alike)
      const rows = elements.map((el) => ({
        wedding_id: wedding.id,
        table_name: JSON.stringify({
          type: el.type,
          label: el.label,
          width: el.width,
          height: el.height,
          rotation: el.rotation ?? 0,
        }),
        capacity: el.capacity ?? 0,
        position_x: el.x,
        position_y: el.y,
      }));

      if (rows.length > 0) {
        const { error } = await supabase.from("seating_tables").insert(rows);
        if (error) throw error;
      }

      // Save assignments to guests' table_number field
      const elementIndexMap: Record<string, number> = {};
      elements.forEach((e, i) => { elementIndexMap[e.id] = i + 1; });

      for (const g of guests) {
        const tn = assignments[g.id] ? (elementIndexMap[assignments[g.id]] ?? null) : null;
        await supabase.from("guests").update({ table_number: tn }).eq("id", g.id);
      }


      toast.success("התכנון נשמר בהצלחה!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }, [wedding?.id, elements, guests, assignments]);

  // Stats
  const stats = useMemo(() => {
    const totalGuests = guests.reduce((sum, guest) => sum + getGuestTotal(guest), 0);
    const assigned = Object.entries(assignments).reduce((sum, [guestId]) => {
      const guest = guests.find((g) => g.id === guestId);
      return sum + (guest ? getGuestTotal(guest) : 0);
    }, 0);
    const confirmed = guests
      .filter((g) => g.rsvp_status === "confirmed")
      .reduce((sum, guest) => sum + getGuestTotal(guest), 0);
    const tables = elements.filter((e) => e.type === "round-table" || e.type === "rect-table").length;
    const totalCapacity = elements
      .filter((e) => e.type === "round-table" || e.type === "rect-table")
      .reduce((sum, e) => sum + (e.capacity ?? 0), 0);
    return { totalGuests, assigned, confirmed, tables, totalCapacity };
  }, [guests, assignments, elements]);

  if (weddingLoading) {
    return (
      <SidebarLayout variant="couple">
        <div className="flex items-center justify-center h-96">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout variant="couple">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">תכנון ישיבה</h1>
          <p className="mt-1 font-body text-muted-foreground">סדרו שולחנות, שבצו מוזמנים ותכננו את מפת האירוע</p>
        </div>
        <Button onClick={saveLayout} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? "שומר..." : "שמירה"}
        </Button>
      </div>

      {/* Stats bar */}
      <div className="mt-4 flex flex-wrap gap-3">
        {[
          { label: "שולחנות", value: stats.tables, color: "bg-primary/10 text-primary" },
          { label: "מקומות", value: stats.totalCapacity, color: "bg-sage-light text-sage" },
          { label: "שובצו", value: stats.assigned, color: "bg-accent/10 text-accent" },
          { label: "אישרו הגעה", value: stats.confirmed, color: "bg-sage-light text-sage" },
          { label: 'סה"כ מוזמנים', value: stats.totalGuests, color: "bg-secondary text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl px-4 py-2 text-sm font-body ${s.color}`}>
            <span className="font-bold">{s.value}</span> {s.label}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mt-5">
        <TabsList className="mb-4">
          <TabsTrigger value="canvas" className="gap-2">
            <Map size={16} /> מפת אירוע
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <TableProperties size={16} /> תצוגת טבלה
          </TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="mt-0">
          <div className="flex gap-4" style={{ height: "calc(100vh - 320px)" }}>
            {/* Left sidebar: palette + settings */}
            <div className="w-56 shrink-0 space-y-4 overflow-y-auto">
              <ElementPalette onAdd={addElement} />
              {selectedElement && (
                <ElementSettings
                  element={selectedElement}
                  onUpdate={updateElement}
                  onDelete={deleteElement}
                />
              )}
            </div>

            {/* Canvas */}
            <SeatingCanvas
              elements={elements}
              selectedId={selectedId}
              onSelectElement={setSelectedId}
              onMoveElement={moveElement}
              getAssignedCount={getAssignedCount}
            />

            {/* Right sidebar: guest assignment */}
            <div className="w-64 shrink-0">
              <GuestAssignPanel
                guests={guests}
                assignments={assignments}
                selectedElementId={selectedId}
                selectedElementLabel={selectedElement?.label ?? ""}
                onAssign={assignGuest}
                onUnassign={unassignGuest}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <SeatingTableView
            elements={elements}
            guests={guests}
            assignments={assignments}
            onUnassign={unassignGuest}
            onSelectElement={(id) => { setSelectedId(id); setTab("canvas"); }}
          />
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
};

export default SeatingPage;
