export interface CsvGuestRow {
  full_name: string;
  phone: string | null;
  email: string | null;
  group: string | null;
  plus_ones: number;
  notes: string | null;
}

const HEADER_MAP: Record<string, keyof CsvGuestRow> = {
  "שם מלא": "full_name",
  "שם": "full_name",
  "full_name": "full_name",
  "name": "full_name",
  "טלפון": "phone",
  "phone": "phone",
  "אימייל": "email",
  "email": "email",
  "קבוצה": "group",
  "group": "group",
  "מלווים": "plus_ones",
  "plus_ones": "plus_ones",
  "הערות": "notes",
  "notes": "notes",
};

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsv(text: string): { rows: CsvGuestRow[]; groups: string[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], groups: [], errors: ["הקובץ ריק או חסרת שורת כותרת"] };

  const headerCells = parseCsvLine(lines[0]);
  const columnMap: (keyof CsvGuestRow | null)[] = headerCells.map((h) => HEADER_MAP[h.toLowerCase()] ?? HEADER_MAP[h] ?? null);

  if (!columnMap.includes("full_name")) {
    return { rows: [], groups: [], errors: ['חסרה עמודת "שם מלא" בכותרת הקובץ'] };
  }

  const rows: CsvGuestRow[] = [];
  const groupSet = new Set<string>();
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row: CsvGuestRow = { full_name: "", phone: null, email: null, group: null, plus_ones: 0, notes: null };

    columnMap.forEach((key, idx) => {
      if (!key || idx >= cells.length) return;
      const val = cells[idx].trim();
      if (!val) return;

      switch (key) {
        case "full_name":
          row.full_name = val;
          break;
        case "phone":
          row.phone = val;
          break;
        case "email":
          row.email = val;
          break;
        case "group":
          row.group = val;
          groupSet.add(val);
          break;
        case "plus_ones":
          row.plus_ones = Math.max(parseInt(val, 10) || 0, 0);
          break;
        case "notes":
          row.notes = val;
          break;
      }
    });

    if (!row.full_name) {
      errors.push(`שורה ${i + 1}: חסר שם מלא — דילוג`);
      continue;
    }

    rows.push(row);
  }

  return { rows, groups: Array.from(groupSet).sort(), errors };
}
