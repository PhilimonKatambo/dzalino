import * as XLSX from "xlsx";
import rawData from "../data/expensesRaw.json";

/**
 * Load the embedded xlsx workbook from /assets and return the raw
 * rows for the first worksheet. The dataset only has one sheet, but
 * we still use the first sheet name defensively. If the workbook
 * fetch fails (for example in environments where the binary asset is
 * not served) we fall back to the JSON mirror committed under
 * src/data/expensesRaw.json.
 */
export async function loadExpensesWorkbook() {
  try {
    const response = await fetch(process.env.PUBLIC_URL + "/assets/DzalinoData.xlsx");
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      const firstSheet = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheet];
      return XLSX.utils.sheet_to_json(sheet, {
        raw: true,
        defval: null,
        header: 1,
      });
    }
  } catch (err) {
    // ignore - fall back to bundled JSON
  }
  return rawData;
}

/** Convert dd/mm/yyyy strings or Excel date serials to a Date object. */
function parseDate(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    // Excel serial date (days since 1899-12-30)
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + value * 86400000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const str = String(value).trim();
  // dd/mm/yyyy
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, dd, mm, yy] = m;
    const year = yy.length === 2 ? Number(`20${yy}`) : Number(yy);
    const d = new Date(year, Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

const HEADER_ALIASES = {
  index: ["index", "no", "#", "id"],
  date: ["date", "day"],
  quantity: ["quantity", "qty", "units"],
  description: ["description", "item", "details", "particulars"],
  price: ["price(k)", "price", "unit price", "unitprice"],
  total: ["total(k)", "total", "amount", "value"],
  category: ["category", "type", "group"],
};

function normaliseHeader(label) {
  return String(label || "").trim().toLowerCase();
}

function findColumn(headerRow, candidates) {
  for (let i = 0; i < headerRow.length; i += 1) {
    const h = normaliseHeader(headerRow[i]);
    if (candidates.includes(h)) return i;
  }
  return -1;
}

/**
 * Normalise the raw row array into a clean object. The source data uses
 * a header row at index 0 and 81 expense rows after that. Dates are
 * provided in dd/mm/yyyy format or Excel serials, so we coerce them.
 */
export function parseExpenseRows(rows) {
  if (!rows || rows.length === 0) return [];
  const header = rows[0];
  const cols = {
    index: findColumn(header, HEADER_ALIASES.index),
    date: findColumn(header, HEADER_ALIASES.date),
    quantity: findColumn(header, HEADER_ALIASES.quantity),
    description: findColumn(header, HEADER_ALIASES.description),
    price: findColumn(header, HEADER_ALIASES.price),
    total: findColumn(header, HEADER_ALIASES.total),
    category: findColumn(header, HEADER_ALIASES.category),
  };

  const records = [];
  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r];
    if (!row || row.every((c) => c == null || c === "")) continue;
    const total = Number(row[cols.total]);
    const price = Number(row[cols.price]);
    const qty = Number(row[cols.quantity]);
    const record = {
      id: row[cols.index] != null ? Number(row[cols.index]) : r,
      date: parseDate(row[cols.date]),
      rawDate: row[cols.date],
      quantity: Number.isFinite(qty) ? qty : 0,
      description: String(row[cols.description] ?? "").trim(),
      unitPrice: Number.isFinite(price) ? price : 0,
      total: Number.isFinite(total) ? total : 0,
      category: String(row[cols.category] ?? "Uncategorised").trim() || "Uncategorised",
    };
    records.push(record);
  }
  return records.sort((a, b) => {
    const ta = a.date ? a.date.getTime() : 0;
    const tb = b.date ? b.date.getTime() : 0;
    return ta - tb;
  });
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonthYear(date) {
  if (!date) return "—";
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDate(date) {
  if (!date) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function formatKwacha(value) {
  if (!Number.isFinite(value)) return "K0";
  if (Math.abs(value) >= 1_000_000) {
    return `K${(value / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `K${(value / 1_000).toFixed(1)}k`;
  }
  return `K${Math.round(value).toLocaleString("en-US")}`;
}
