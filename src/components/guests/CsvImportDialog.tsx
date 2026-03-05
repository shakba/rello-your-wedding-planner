import { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { parseCsv, CsvGuestRow } from "@/lib/csv-parser";
import { supabase } from "@/integrations/supabase/client";
import { GuestGroup } from "@/types/wedding";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CsvImportDialogProps {
  weddingId: string;
  existingGroups: GuestGroup[];
  onImportDone: () => void;
}

const CsvImportDialog = ({ weddingId, existingGroups, onImportDone }: CsvImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ rows: CsvGuestRow[]; groups: string[]; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsv(text);
      setPreview(result);
    };
    reader.readAsText(file, "utf-8");
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!preview || preview.rows.length === 0) return;
    setImporting(true);

    try {
      // 1. Create missing groups
      const existingGroupNames = new Set(existingGroups.map((g) => g.name));
      const newGroupNames = preview.groups.filter((g) => !existingGroupNames.has(g));

      let allGroups = [...existingGroups];

      if (newGroupNames.length > 0) {
        const { data: createdGroups, error: groupError } = await supabase
          .from("guest_groups")
          .insert(newGroupNames.map((name) => ({ wedding_id: weddingId, name })))
          .select("*");

        if (groupError) {
          toast.error("שגיאה ביצירת קבוצות");
          setImporting(false);
          return;
        }
        allGroups = [...allGroups, ...(createdGroups ?? [])];
      }

      // 2. Map group names to IDs
      const groupMap = new Map(allGroups.map((g) => [g.name, g.id]));

      // 3. Insert guests in batches of 50
      const guestInserts = preview.rows.map((row) => ({
        wedding_id: weddingId,
        full_name: row.full_name,
        phone: row.phone,
        email: row.email,
        plus_ones: row.plus_ones,
        notes: row.notes,
        group_id: row.group ? groupMap.get(row.group) ?? null : null,
      }));

      const batchSize = 50;
      let insertedCount = 0;

      for (let i = 0; i < guestInserts.length; i += batchSize) {
        const batch = guestInserts.slice(i, i + batchSize);
        const { error } = await supabase.from("guests").insert(batch);
        if (error) {
          toast.error(`שגיאה בייבוא שורות ${i + 1}-${i + batch.length}`);
          console.error("Import batch error:", error);
        } else {
          insertedCount += batch.length;
        }
      }

      toast.success(`יובאו ${insertedCount} מוזמנים בהצלחה!`);
      setPreview(null);
      setOpen(false);
      onImportDone();
    } catch (err) {
      console.error("Import error:", err);
      toast.error("שגיאה בייבוא הקובץ");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/guests-template.csv";
    link.download = "guests-template.csv";
    link.click();
  };

  const resetPreview = () => {
    setPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetPreview(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-body">
          <Upload size={18} /> ייבוא מ-CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">ייבוא מוזמנים מקובץ CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download template */}
          <button
            onClick={downloadTemplate}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-right transition-colors hover:bg-muted/60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Download size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-body font-medium text-foreground">הורדת קובץ לדוגמה</p>
              <p className="font-body text-sm text-muted-foreground">הורידו את הטמפלט, מלאו את הפרטים, והעלו בחזרה</p>
            </div>
          </button>

          {/* Upload area */}
          {!preview ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 transition-colors hover:border-primary/50 hover:bg-primary/10"
            >
              <FileSpreadsheet size={36} className="text-primary/60" />
              <p className="font-body font-medium text-foreground">לחצו לבחירת קובץ CSV</p>
              <p className="font-body text-sm text-muted-foreground">או גררו קובץ לכאן</p>
            </button>
          ) : (
            /* Preview */
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-body">
                  <CheckCircle2 size={14} className="ml-1" />
                  {preview.rows.length} מוזמנים
                </Badge>
                {preview.groups.length > 0 && (
                  <Badge variant="outline" className="font-body">
                    {preview.groups.length} קבוצות
                  </Badge>
                )}
                {preview.errors.length > 0 && (
                  <Badge variant="destructive" className="font-body">
                    <AlertCircle size={14} className="ml-1" />
                    {preview.errors.length} שגיאות
                  </Badge>
                )}
              </div>

              {/* Groups list */}
              {preview.groups.length > 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 font-body text-sm font-medium text-foreground">קבוצות שיווצרו:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.groups.map((g) => {
                      const exists = existingGroups.some((eg) => eg.name === g);
                      return (
                        <Badge key={g} variant={exists ? "secondary" : "default"} className="font-body text-xs">
                          {g} {exists && "(קיימת)"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Preview table */}
              <ScrollArea className="h-48 rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 font-body text-muted-foreground">
                      <th className="px-3 py-2 text-right">שם</th>
                      <th className="px-3 py-2 text-right">טלפון</th>
                      <th className="px-3 py-2 text-right">קבוצה</th>
                      <th className="px-3 py-2 text-right">מלווים</th>
                    </tr>
                  </thead>
                  <tbody className="font-body">
                    {preview.rows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-1.5">{row.full_name}</td>
                        <td className="px-3 py-1.5 text-muted-foreground" dir="ltr">{row.phone || "—"}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{row.group || "—"}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{row.plus_ones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.rows.length > 50 && (
                  <p className="p-2 text-center font-body text-xs text-muted-foreground">
                    ועוד {preview.rows.length - 50} מוזמנים נוספים...
                  </p>
                )}
              </ScrollArea>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="mb-1 font-body text-sm font-medium text-destructive">שגיאות:</p>
                  {preview.errors.map((err, i) => (
                    <p key={i} className="font-body text-xs text-destructive/80">{err}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="hero"
                  onClick={handleImport}
                  disabled={importing || preview.rows.length === 0}
                >
                  {importing ? "מייבא..." : `ייבוא ${preview.rows.length} מוזמנים`}
                </Button>
                <Button variant="outline" onClick={() => { resetPreview(); fileRef.current?.click(); }}>
                  בחירת קובץ אחר
                </Button>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFile}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;
