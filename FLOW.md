# Dzalino – code flow

This document explains how the Dzalino expense / production dashboard boots, where the data comes from, and which file is responsible for each piece of UI or calculation.

Dzalino is a single-page React + Redux Toolkit app. The frontend stores everything in one Redux slice (`src/expenseSlice.js`) and reads from / writes to a small backend API. The default backend URL is `process.env.REACT_APP_BACKEND_URI` (set to `http://localhost:1000` in `.env`). There is no local workbook loader and no theme toggle – this document was previously written for an earlier version of the app.

> Folder note: the components folder is misspelled `src/componets/` (without the second `n`). Do not "fix" it casually – every import in the project points there.

## 1. Boot sequence

1. **`public/index.html`** defines `<div id="root">` and sets the title to `Dzalino · Expense Intelligence`. It preloads the Inter font.
2. **`src/index.js`** mounts the React 19 root into `#root`, wraps `<App />` in a Redux `<Provider store={store}>`, and calls `reportWebVitals()`.
3. **`src/store.js`** configures a single Redux store with one reducer, `expenseReducer` (from `src/expenseSlice.js`).
4. **`src/App.js`** dispatches four async thunks on mount and renders the page shell:
   - `<Cards />` (KPI strip)
   - The four input forms (`<ExpenseInput />`, `<TakenInput />`, `<DrumsInput />`, `<ProducedInput />`)
   - `<Calculations />` (raw-material cost breakdown)
   - `<AllExpense />` (searchable / paginated ledger)
   - `<Charts />` (Recharts line chart)
5. **`src/expenseSlice.js`** owns the source of truth. The slice state is `{ expenses, taken, drums, produced, loading, error }` and is fed by four `createAsyncThunk` actions: `fetchExpenses`, `fetchTaken`, `fetchDrums`, `fetchProduced`.

```
index.js
  +- Provider (store)
       +- App
            +- useEffect: dispatch(fetchExpenses, fetchTaken, fetchDrums, fetchProduced)
            +- Cards          (KPI cards, one per entity)
            +- ExpenseInput   (POST /expense/insert)
            +- TakenInput     (POST /taken/insert)
            +- DrumsInput     (POST /drums/insert)
            +- ProducedInput  (POST /dailyProduce/insert)
            +- Calculations   (Big papers / Big cartons cost breakdown)
            +- AllExpense     (filter + sort + paginated table)
            +- Charts         (line chart, daily spend by category)
```

## 2. Network layer

All HTTP calls go to the backend whose base URL is `process.env.REACT_APP_BACKEND_URI` (falling back to `http://localhost:1000`). The package list in `package.json` includes both `axios` (used by the slice) and the native `fetch` API (used by every form). There is no retry, no caching, and no auth header.

### Reads (`src/expenseSlice.js`)

| Thunk | Method | Endpoint | Slices into |
| --- | --- | --- | --- |
| `fetchExpenses` | `GET` | `/expense/data` | `state.expenses.expenses` |
| `fetchTaken` | `GET` | `/taken/data` | `state.expenses.taken` |
| `fetchDrums` | `GET` | `/drums/data` | `state.expenses.drums` |
| `fetchProduced` | `GET` | `/dailyProduce/data` | `state.expenses.produced` |

Each thunk is `axios.get(URL)`. The slice uses `extraReducers` (not `createAsyncThunk`'s automatic reducers) to set `loading = true` on `.pending`, write the payload on `.fulfilled`, and capture the error message on `.rejected`. The four `loading` branches all share the same `state.loading` / `state.error` flags, so any read shows a "Loading…" indicator everywhere.

### Writes

Each form does a plain `fetch(..., { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })`. On `!response.ok` the form attempts to read `data.message || data.error` from the response body before surfacing a generic failure. After a successful save the form clears itself and shows a 1-second green "Record Saved!" message, but **the Redux cache is not refreshed** – the user must reload the page (or wait for the next natural refetch) to see the new record in tables, charts, and KPI cards. This is a known gap.

| Form | Endpoint | Payload |
| --- | --- | --- |
| `ExpenseInput` | `POST /expense/insert` | `{ Date, Description, Category, Qty, Unit_Price, Total }` |
| `TakenInput` | `POST /taken/insert` | `{ Date, Qty, Category, Receiver }` |
| `DrumsInput` | `POST /drums/insert` | `{ Date, Qty }` |
| `ProducedInput` | `POST /dailyProduce/insert` | `{ Date, Qty, Category }` |

> `ExpenseInput` and `Calculations` use the env-var-aware `BACKEND_URL`; the other three forms hard-code `http://localhost:1000`. See the "Where to make changes" table.

## 3. KPI cards (`src/componets/cards.js`)

`Cards` renders a fixed grid: `TotalExpenseCard`, `TotalTakenCard`, `TotalProducedCard`, `TotalDrumsCard`, `LargetExpense` (sic), `AverageExpense`, `TopCategory`. Two further components, `Categories` and `CoverageDuration`, are defined but not rendered.

Each KPI subscribes to its own slice of state and recomputes inside `useEffect` on the relevant array. The `list_safe()` helper at the bottom of the file is used everywhere to guard against non-array data while the initial fetch is in flight.

| Card | Source | Calculation |
| --- | --- | --- |
| `TotalExpenseCard` | `state.expenses.expenses` | `sum(e.Total)` |
| `TotalTakenCard` | `state.expenses.taken` | `sum(e.Qty)` (c/s sold) |
| `TotalProducedCard` | `state.expenses.produced` | `sum(e.Qty)` (c/s produced) |
| `TotalDrumsCard` | `state.expenses.drums` | `sum(e.Qty)` (drums given) |
| `LargetExpense` | `state.expenses.expenses` | `max(e.Total)` and `min(e.Total)` for the subtitle |
| `AverageExpense` | `state.expenses.expenses` | `sum(e.Total) / length`, capped to 2 fraction digits |
| `TopCategory` | `state.expenses.expenses` | Group by `e.Category`, sort totals desc, take the first key |
| `Categories` *(unused)* | `state.expenses.expenses` | Unique non-empty `e.Category` count |
| `CoverageDuration` *(unused)* | `state.expenses.expenses` | Min / max date and the month / day span; contains its own `parseDate` and `getDateValue` helpers (the only "coverage" code in the project) |

`parseDate` (local to `CoverageDuration`) understands JS `Date` instances, Excel serial numbers (`raw - 25569`), `dd/mm/yyyy` strings, and ISO strings – the same logic is duplicated in `Charts.js` and `allExpense.js`.

## 4. The four input forms

All four live in `src/componets/` and share the `expenseInput.css` stylesheet. They all keep a small piece of local UI state (`showForm`, `feedback`, `error`, `submitting`) and toggle open / closed with a header button.

### `ExpenseInput.js`

- Fields: date, description, category (free text with a `<datalist>` of suggestions and 6 chip buttons for the most common categories: food, transport, labour, asset, rent, office, marketing, maintenance, salaries), quantity, unit price, total.
- Auto-calc: editing either `qty` or `unitPrice` recomputes `total = qty * unitPrice` to two decimals.
- Validation: date required, description non-empty, category non-empty, qty > 0, unit price ≥ 0, total ≥ 0. Errors render as red banners above the actions.
- The total `BACKEND_URL` is read from `REACT_APP_BACKEND_URI` and trailing slashes are stripped.

### `TakenInput.js` (Add sold c/s)

- Fields: date, quantity, category (dropdown of `Nips`, `Bigs_papers`, `Bigs_cartons`), receiver.
- Validation: date, category, receiver, and a positive quantity are required. POSTs `{ Date, Qty, Category, Receiver }`.

### `DrumsInput.js` (Add drums given)

- Fields: date, quantity.
- Validation: date and positive quantity. POSTs `{ Date, Qty }`.

### `ProducedInput.js` (Add produced c/s)

- Fields: date, quantity, category (same dropdown as `TakenInput`, defaulted to `Nips`).
- Validation: date, category, positive quantity. POSTs `{ Date, Qty, Category }`.

## 5. `Calculations.js` (raw-material breakdown)

`Calculations` reads `state.expenses.produced`, sums `Qty` separately for `Category === "Bigs_papers"` and `Category === "Bigs_cartons"`, and passes the totals to `BigPapers` and `BigCartons`.

Each side renders the same shape: a hard-coded `rawMaterials` map of `[unitCost, multiplier]` pairs (Bottles, MRA_Stickers, Stickers, Rid, Labour, Ethanol, Other, plus `Carton` for cartons). The two `rawMaterials` maps differ only in the `Carton` row – `BigPapers` sets the carton cost to `0`, `BigCartons` sets it to `100`.

For each entry the UI shows `K{cost} x {multiplier} = K{cost*multiplier}`, then a "Total" row that sums the per-row products, and finally a "Total Expense X Total Produce" row equal to `total * totalProduce`. The `amount = 12` and `cls = 1` constants are hard-coded and represent "per dozen c/s" multipliers, not real Redux state.

Icons are pulled from `lucide-react` and matched to keys in a per-component `Icons` object.

## 6. `allExpense.js` (the ledger)

`AllExpense` is the only place that owns non-form UI state besides the inputs. Local state: `search`, `category`, `sortBy` (default `date_desc`), `page`.

1. `categories` is `["All", ...unique(e.Category).sort()]` derived via `useMemo`.
2. `filtered` applies the category filter and a case-insensitive `search` over `Description`, `Category`, `Date`, and `_id`.
3. `sorted` is the filtered list reordered by `compareExpenses(a, b, sortBy)`. The sort options are: date (asc/desc), amount (asc/desc), category (asc/desc), description (asc/desc), quantity (asc/desc). Date comparison falls through to the `parseDateSafe` helper at the bottom of the file (yet another copy of the date parser).
4. `totalPages = max(1, ceil(sorted.length / 12))`. The visible page is `sorted.slice((page-1)*12, page*12)`. The pager shows First / Prev / "Page X of Y" / Next / Last.
5. Changing any of `search`, `category`, or `sortBy` resets the page to 1 via a small `useEffect`.
6. A footer line above the table summarises `{count} records – K{sum} total – {qty} units` for the *filtered* (not the page-sized) set.

`formatDateCell` renders the date column as `dd/mm/yyyy` (or the raw value if the date is unparseable). The "Unit Price" column reads `e["UnitPrice"]`; the POST writes it as `Unit_Price`. **If the backend does not normalise that key the unit-price cell will be `K0` for every row.**

## 7. `charts.js` (the only chart)

`Charts` is a single-component file that builds a Recharts `<LineChart>` titled "Expenses per Category Over Time".

1. `buildSeriesData(expenses)` runs inside `useMemo`:
   - Filters expenses that have both a parseable date and a non-empty `Category`. The `getDateValue` helper tries `Date`, `date`, `"Date "`, `" date"`, `ExpenseDate`, `expenseDate`, `createdAt`, `Day` in that order.
   - Finds the global min and max date.
   - Walks every day from `start` to `end` (inclusive) at local midnight, building a `dayMap` of `{ key, date, year, month, dateOfMonth, dayNumber, dayLabel }`.
   - Tallies spend per (day, category) and collects the sorted category set.
   - Emits one row per day with `idx`, `key`, `dayNumber`, `dayLabel`, `year`, `month`, plus one numeric field per category.
   - Builds `monthBands` (start/end index per month) so the chart can render alternating `<ReferenceArea>` stripes and a two-tier axis below the chart.
2. The Y-axis tick formatter prepends `K` and uses `Number(v).toLocaleString()`.
3. `CurrencyTooltip` sorts the segments by value descending, shows a colored swatch + name + value, and a "Total" footer.
4. `TwoTierAxis` is a hand-rolled HTML overlay: a day-number row whose tick stride is `max(1, ceil(rows.length / 12))`, and a month/year row whose label is centred inside each band.

The `SERIES_COLORS` palette is hard-coded (10 colors). If there are more than 10 categories the colors wrap around.

## 8. Styling

- `src/App.css` and `src/index.css` for the page shell and the `<body>` reset.
- `src/componets/cards.css` for the KPI grid.
- `src/componets/charts.css` for the line chart and `CurrencyTooltip`.
- `src/componets/expenseInput.css` for the four forms (they share a single stylesheet even though the file is named after one form).
- `src/componets/calculations.css` for the raw-material tables.
- `src/allExpense.css` for the ledger.
- `public/logo192.png`, `public/logo512.png`, and `public/favicon.ico` for branding.
- The `Inter` font is loaded from Google Fonts in `public/index.html`.

There is no theming. The dashboard always renders in the dark color palette defined in `cards.css` / `charts.css`.

## 9. Where to make changes

| You want to… | Open |
| --- | --- |
| Add or rename a column on the expense record | `src/expenseSlice.js` (read URL), `src/componets/expenseInput.js` (POST payload + form), `src/allExpense.js` (table + `compareExpenses`), `src/componets/cards.js` (KPI aggregations) |
| Change a KPI definition | The corresponding `*Card` component at the top of `src/componets/cards.js` |
| Change the chart series / colors / tooltip | `src/componets/charts.js` (`buildSeriesData`, `SERIES_COLORS`, `CurrencyTooltip`, `TwoTierAxis`) |
| Change ledger sorting, filtering, or paging | `src/allExpense.js` (`SORT_OPTIONS`, `compareExpenses`, `PAGE_SIZE`) |
| Add a new form / entity | Copy one of the `*Input.js` files; add a new thunk + reducer case in `src/expenseSlice.js`; add a new `*Card` in `cards.js`; wire it into `App.js` |
| Change the backend URL | Set `REACT_APP_BACKEND_URI` in `.env`. The `INSERT_URL` builder in `ExpenseInput` already respects it, but the other three forms hard-code `http://localhost:1000` and must be edited to match |
| Change the raw-material cost table | `rawMaterials` object in `BigPapers` and `BigCartons` inside `src/componets/Calculations.js` |
| Refresh Redux data after a write | The four form `handleSubmit` functions all POST but never `dispatch(fetchExpenses / fetchTaken / ...)`. Adding the dispatch after `setFeedback` would close the cache-staleness gap |

## 10. Known sharp edges

- **Spelling.** `componets` (not `components`) is intentional; `LargetExpense` is a typo that is referenced in the JSX tree, so renames must touch the file and its call site together.
- **Stale data after writes.** Successful POSTs do not trigger a refetch. KPI cards, the chart, and the ledger will not show the new record until the page is reloaded.
- **Unit price column.** `AllExpense` reads `e["UnitPrice"]` but the form POST sends `Unit_Price`. The unit price column will display `K0` unless the backend normalises the field.
- **Shared `loading` flag.** `expenseSlice.js` writes `state.loading` for all four thunks, so the "Loading…" hint under any form is true whenever *any* of the four endpoints is still in flight.
- **Date parser duplication.** The same `parseDate` / `parseDateSafe` logic lives in `cards.js`, `charts.js`, and `allExpense.js`. A new column or date format will require updating all three.
