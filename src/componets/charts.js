// Combined "Expenses per Category Over Time" line chart and a daily total
// "Expenses per Day" bar chart. Both share the same day-grid builder so the
// X axes line up (day numbers on top, month / year band on the bottom).

import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceArea,
    Cell
} from "recharts";
import "./charts.css";

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const SERIES_COLORS = [
    "#69a6bb",
    "#f4f6e5",
    "#98a087",
    "#e8a87c",
    "#c38d9e",
    "#85dcb0",
    "#e27d60",
    "#41b3a3",
    "#5d5c61",
    "#b8b8ff"
];

// Single bar color for the daily-total chart.
const BAR_COLOR = "#69a6bb";

const Charts = () => {
    const expenses = useSelector((state) => state.expenses.expenses);
    const {
        rows,
        categories,
        start,
        end,
        monthBands,
        totalByDay
    } = useMemo(() => buildSeriesData(expenses), [expenses]);

    if (!rows.length) {
        return (
            <div id="charts">
                <div className="chartCard">
                    <div className="chartTitle">Expenses Over Time</div>
                    <div className="chartEmpty">
                        No dated expenses yet - add records to see the trend.
                    </div>
                </div>
            </div>
        );
    }

    const rangeLabel =
        start && end
            ? `${MONTHS[start.getMonth()]} ${start.getFullYear()} - ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
            : "";

    return (
        <div id="charts">
            <div className="chartCard">
                <div className="chartHeader">
                    <div className="chartTitle">Expenses per Category Over Time</div>
                    <div className="chartSubtitle">
                        Daily spend (K) by category - {rangeLabel}
                    </div>
                </div>
                <div className="chartBody">
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                            data={rows}
                            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid stroke="#3a4a4f" strokeDasharray="3 3" />
                            <YAxis
                                stroke="#98a087"
                                tick={{ fill: "#98a087", fontSize: 12 }}
                                tickFormatter={(v) => `K${Number(v).toLocaleString()}`}
                            />
                            <Tooltip content={<CurrencyTooltip />} />
                            <Legend
                                wrapperStyle={{ color: "#98a087", fontSize: 12 }}
                                iconType="plainline"
                            />
                            {monthBands.map((band, i) => (
                                <ReferenceArea
                                    key={`band-${i}`}
                                    x1={band.start}
                                    x2={band.end}
                                    strokeOpacity={0}
                                    fill={i % 2 === 0 ? "#1f2a2b" : "#27383a"}
                                    fillOpacity={0.55}
                                />
                            ))}
                            {categories.map((cat, i) => (
                                <Line
                                    key={cat}
                                    type="monotone"
                                    dataKey={cat}
                                    name={cat}
                                    stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                                    strokeWidth={1.5}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                    connectNulls
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                    <TwoTierAxis rows={rows} monthBands={monthBands} />
                </div>
            </div>

            <div className="chartCard">
                <div className="chartHeader">
                    <div className="chartTitle">Expenses per Day</div>
                    <div className="chartSubtitle">
                        Total daily spend (K) - {rangeLabel}
                    </div>
                </div>
                <div className="chartBody">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={totalByDay}
                            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                            barCategoryGap={1}
                        >
                            <CartesianGrid stroke="#3a4a4f" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={["dataMin", "dataMax"]}
                                hide
                            />
                            <YAxis
                                stroke="#98a087"
                                tick={{ fill: "#98a087", fontSize: 12 }}
                                tickFormatter={(v) => `K${Number(v).toLocaleString()}`}
                            />
                            <Tooltip
                                content={<DailyBarTooltip />}
                                cursor={{ fill: "#27383a", fillOpacity: 0.4 }}
                            />
                            <Legend
                                wrapperStyle={{ color: "#98a087", fontSize: 12 }}
                                iconType="square"
                            />
                            {monthBands.map((band, i) => (
                                <ReferenceArea
                                    key={`band-bar-${i}`}
                                    x1={band.start}
                                    x2={band.end}
                                    strokeOpacity={0}
                                    fill={i % 2 === 0 ? "#1f2a2b" : "#27383a"}
                                    fillOpacity={0.55}
                                />
                            ))}
                            <Bar
                                dataKey="total"
                                name="Daily total"
                                fill={BAR_COLOR}
                                isAnimationActive={false}
                            >
                                {totalByDay.map((entry, i) => (
                                    <Cell key={`bar-${i}`} fill={BAR_COLOR} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <TwoTierAxis rows={totalByDay} monthBands={monthBands} />
                </div>
            </div>
        </div>
    );
};

const TwoTierAxis = ({ rows, monthBands }) => {
    if (!rows.length) return null;
    const last = rows.length - 1;
    const pct = (i) => {
        const safeLast = Math.max(1, last);
        return `${((i / safeLast) * 100).toFixed(3)}%`;
    };

    // Show day labels with a stride so we never overflow the axis.
    // Aim for ~12 visible day labels regardless of total day count.
    const stride = Math.max(1, Math.ceil(rows.length / 12));

    return (
        <div className="chartAxisWrap">
            <div className="chartAxisDivider" />
            <div className="chartAxisWeek">
                {rows.map((r, i) =>
                    i % stride === 0 ? (
                        <span
                            key={`d-${i}`}
                            className="chartAxisTick"
                            style={{ left: pct(i) }}
                        >
                            {r.dayNumber}
                        </span>
                    ) : null
                )}
            </div>
            <div className="chartAxisMonth">
                {monthBands.map((band, i) => (
                    <span
                        key={`m-${i}`}
                        className="chartAxisTick"
                        style={{ left: pct(band.center) }}
                    >
                        {`${MONTHS[band.month]} ${band.year}`}
                    </span>
                ))}
            </div>
        </div>
    );
};

const CurrencyTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const total = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
    const day = payload[0] && payload[0].payload ? payload[0].payload.dayLabel : label;
    return (
        <div className="chartTooltip">
            <div className="chartTooltipLabel">{day}</div>
            {payload
                .slice()
                .sort((a, b) => (b.value || 0) - (a.value || 0))
                .map((p) => (
                    <div key={p.dataKey} className="chartTooltipRow">
                        <span
                            className="chartTooltipSwatch"
                            style={{ background: p.color }}
                        />
                        <span className="chartTooltipName">{p.name}</span>
                        <span className="chartTooltipValue">
                            K{Number(p.value || 0).toLocaleString()}
                        </span>
                    </div>
                ))}
            <div className="chartTooltipTotal">
                Total: K{Number(total).toLocaleString()}
            </div>
        </div>
    );
};

const DailyBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0] && payload[0].payload ? payload[0].payload : null;
    const day = entry ? entry.dayLabel : label;
    return (
        <div className="chartTooltip">
            <div className="chartTooltipLabel">{day}</div>
            <div className="chartTooltipRow">
                <span
                    className="chartTooltipSwatch"
                    style={{ background: BAR_COLOR }}
                />
                <span className="chartTooltipName">Daily total</span>
                <span className="chartTooltipValue">
                    K{Number(entry ? entry.total : 0).toLocaleString()}
                </span>
            </div>
        </div>
    );
};

const parseDate = (raw) => {
    if (raw == null) return null;
    if (raw instanceof Date) {
        return isNaN(raw.getTime()) ? null : raw;
    }
    if (typeof raw === "number") {
        const utcDays = Math.floor(raw - 25569);
        const d = new Date(utcDays * 86400 * 1000);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof raw === "string") {
        const s = raw.trim();
        if (!s) return null;
        const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
        if (dmy) {
            const day = Number(dmy[1]);
            const month = Number(dmy[2]);
            let year = Number(dmy[3]);
            if (year < 100) year += 2000;
            const d = new Date(year, month - 1, day);
            return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
};

const getDateValue = (e) => {
    const candidates = [
        e.Date, e.date, e["Date "], e[" date"],
        e.ExpenseDate, e.expenseDate, e.createdAt, e.Day
    ];
    for (const c of candidates) {
        const d = parseDate(c);
        if (d) return d;
    }
    return null;
};

const atMidnight = (d) => {
    const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    out.setHours(0, 0, 0, 0);
    return out;
};

const dayKey = (d) => {
    const m = atMidnight(d);
    return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-${String(m.getDate()).padStart(2, "0")}`;
};

const dayLabel = (d) => {
    const m = atMidnight(d);
    return `${String(m.getDate()).padStart(2, "0")} ${MONTHS[m.getMonth()]}`;
};

const list_safe = (v) => (Array.isArray(v) ? v : []);

function buildSeriesData(expenses) {
    const list = list_safe(expenses);
    const dated = list
        .map((e) => ({ ...e, _d: getDateValue(e) }))
        .filter((e) => e._d && e.Category);

    if (!dated.length) {
        return { rows: [], categories: [], start: null, end: null, monthBands: [], totalByDay: [] };
    }

    let start = dated[0]._d;
    let end = dated[0]._d;
    for (const e of dated) {
        if (e._d < start) start = e._d;
        if (e._d > end) end = e._d;
    }

    // Build every day between start and end (inclusive) at midnight
    const dayMap = new Map();
    const cursor = atMidnight(start);
    const last = atMidnight(end);
    let dayCounter = 1;
    while (cursor <= last) {
        const key = dayKey(cursor);
        dayMap.set(key, {
            key,
            date: new Date(cursor),
            year: cursor.getFullYear(),
            month: cursor.getMonth(),
            dateOfMonth: cursor.getDate(),
            dayNumber: dayCounter,
            dayLabel: dayLabel(cursor)
        });
        cursor.setDate(cursor.getDate() + 1);
        dayCounter += 1;
    }
    const dayEntries = Array.from(dayMap.values());

    // Tally spend per (day, category) and per day overall
    const totals = new Map();
    const categorySet = new Set();
    for (const e of dated) {
        const key = dayKey(e._d);
        const row = totals.get(key) || {};
        const cat = e.Category;
        categorySet.add(cat);
        row[cat] = (row[cat] || 0) + (Number(e.Total) || 0);
        totals.set(key, row);
    }

    const categories = Array.from(categorySet).sort();
    const rows = dayEntries.map((d, idx) => {
        const values = totals.get(d.key) || {};
        const row = {
            idx,
            key: d.key,
            dayNumber: d.dayNumber,
            dayLabel: d.dayLabel,
            year: d.year,
            month: d.month
        };
        for (const cat of categories) {
            row[cat] = Number((values[cat] || 0).toFixed(2));
        }
        return row;
    });

    // Daily-total bar series: numeric X axis aligned to the row index plus
    // a copy of the day metadata so the tooltip and axis can reuse it.
    const totalByDay = rows.map((r) => {
        let total = 0;
        for (const cat of categories) total += Number(r[cat]) || 0;
        return {
            x: r.idx,
            total: Number(total.toFixed(2)),
            dayNumber: r.dayNumber,
            dayLabel: r.dayLabel,
            year: r.year,
            month: r.month
        };
    });

    // Build month bands from the day list
    const monthBands = [];
    let currentMonth = -1;
    let currentYear = -1;
    let bandStart = 0;
    for (let i = 0; i < rows.length; i++) {
        const m = rows[i].month;
        const y = rows[i].year;
        if (m == null || y == null) continue;
        if (m !== currentMonth || y !== currentYear) {
            if (currentMonth !== -1) {
                monthBands.push({
                    month: currentMonth,
                    year: currentYear,
                    start: bandStart,
                    end: i - 1,
                    center: bandStart + (i - 1 - bandStart) / 2
                });
            }
            currentMonth = m;
            currentYear = y;
            bandStart = i;
        }
    }
    if (currentMonth !== -1) {
        monthBands.push({
            month: currentMonth,
            year: currentYear,
            start: bandStart,
            end: rows.length - 1,
            center: bandStart + (rows.length - 1 - bandStart) / 2
        });
    }

    return { rows, categories, start, end, monthBands, totalByDay };
}

export default Charts;
