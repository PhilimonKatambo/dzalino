# Data assets

`expensesRaw.json` is a static mirror of the `DzalinoData.xlsx` workbook (sheet `expenses_data_ddmmyyyy`).

It is bundled at build time so the dashboard can render the analytics without depending on the binary file. The runtime app still tries to fetch the original xlsx first, and falls back to this JSON if the fetch fails.
