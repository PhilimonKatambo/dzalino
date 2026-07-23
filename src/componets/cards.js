import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import './cards.css'

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Cards = () => {
    return (
        <div id="cards">
            <TotalExpenseCard />
            <TotalTakenCard />
            <TotalProducedCard />
            <TotalDrumsCard />
            <LargetExpense />
            <AverageExpense />
            <TopCategory />
            {/* <Categories /> */}
            {/* <CoverageDuration /> */}
        </div>
    )
}

const TotalExpenseCard = () => {
    const expenses = useSelector(
        (state) => state.expenses.expenses
    );

    const [total, setTotal] = useState(0);

    useEffect(() => {
        let total1 = 0;
        list_safe(expenses).forEach(element => {
            total1 = total1 + (Number(element.Total) || 0);
        });
        setTotal(total1);
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Total Spend</div>
            <div id="actNumber">K{Number(total).toLocaleString()}.00</div>
            <div id="subExp">{Number(list_safe(expenses).length).toLocaleString()} tracked records</div>
        </div>
    )
}


const TotalTakenCard = () => {
    const taken = useSelector(
        (state) => state.expenses.taken
    );

    const [total, setTotal] = useState(0);

    useEffect(() => {
        let total1 = 0;
        list_safe(taken).forEach(element => {
            total1 = total1 + (Number(element.Qty) || 0);
        });
        setTotal(total1);
    }, [taken])

    return (
        <div id="exCard">
            <div id="word">Total Dzalino cls Sold</div>
            <div id="actNumber">{Number(total).toLocaleString()} c/s</div>
            <div id="subExp">{Number(list_safe(taken).length).toLocaleString()} times</div>
        </div>
    )
}

const TotalProducedCard = () => {
    const taken = useSelector(
        (state) => state.expenses.produced
    );

    const [total, setTotal] = useState(0);

    useEffect(() => {
        let total1 = 0;
        list_safe(taken).forEach(element => {
            total1 = total1 + (Number(element.Qty) || 0);
        });
        setTotal(total1);
    }, [taken])

    return (
        <div id="exCard">
            <div id="word">Total c/s Produced</div>
            <div id="actNumber">{Number(total).toLocaleString()} C/s</div>
            <div id="subExp">{Number(list_safe(taken).length).toLocaleString()} times</div>
        </div>
    )
}

const TotalDrumsCard = () => {
    const taken = useSelector(
        (state) => state.expenses.drums
    );

    const [total, setTotal] = useState(0);

    useEffect(() => {
        let total1 = 0;
        list_safe(taken).forEach(element => {
            total1 = total1 + (Number(element.Qty) || 0);
        });
        setTotal(total1);
    }, [taken])

    return (
        <div id="exCard">
            <div id="word">Total Drums given</div>
            <div id="actNumber">{Number(total).toLocaleString()} drums</div>
            <div id="subExp">{Number(list_safe(taken).length).toLocaleString()} times</div>
        </div>
    )
}




const LargetExpense = () => {
    const expenses = useSelector(
        (state) => state.expenses.expenses
    );

    const [big, setBig] = useState(0);
    const [low, setLow] = useState(0);

    useEffect(() => {
        const all = list_safe(expenses).map(e => Number(e.Total) || 0);
        setBig(all.length ? Math.max(...all) : 0)
        setLow(all.length ? Math.min(...all) : 0)
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Largest Expense</div>
            <div id="actNumber">K{Number(big).toLocaleString()}.00</div>
            <div id="subExp">Smallest K{Number(low).toLocaleString()}</div>
        </div>
    )
}

const AverageExpense = () => {
    const expenses = useSelector(
        (state) => state.expenses.expenses
    );

    const [avg, setAvg] = useState(0);

    useEffect(() => {
        const list = list_safe(expenses);
        if (!list.length) {
            setAvg(0);
            return;
        }
        const sum = list.reduce((s, e) => s + (Number(e.Total) || 0), 0);
        setAvg(sum / list.length);
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Average Expense</div>
            <div id="actNumber">K{Number(avg).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div id="subExp">Mean across {Number(list_safe(expenses).length).toLocaleString()} records</div>
        </div>
    )
}

const TopCategory = () => {
    const expenses = useSelector(
        (state) => state.expenses.expenses
    );

    const [top, setTop] = useState({ name: "\u2014", total: 0 });

    useEffect(() => {
        const list = list_safe(expenses);
        if (!list.length) {
            setTop({ name: "\u2014", total: 0 });
            return;
        }
        const totals = list.reduce((acc, e) => {
            const cat = e.Category || "Uncategorized";
            acc[cat] = (acc[cat] || 0) + (Number(e.Total) || 0);
            return acc;
        }, {});
        const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
        setTop({ name: sorted[0][0], total: sorted[0][1] });
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Top Category</div>
            <div id="actNumber">{top.name}</div>
            <div id="subExp">K{Number(top.total).toLocaleString()} spent</div>
        </div>
    )
}

const Categories = () => {
    const expenses = useSelector(
        (state) => state.expenses.expenses
    );

    const [cats, setCats] = useState([]);

    useEffect(() => {
        const all = [];
        list_safe(expenses).forEach(element => {
            all.push(element.Category);
        });
        setCats([...new Set(all)])
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Categories</div>
            <div id="actNumber">{Number(cats.length).toLocaleString()}</div>
            <div id="subExp">All expenses</div>
        </div>
    )
}

const CoverageDuration = () => {
    const expenses = useSelector(
        (state) => state.expenses.expenses
    );

    const [coverage, setCoverage] = useState({
        start: null,
        end: null,
        startLabel: "\u2014",
        endLabel: "\u2014",
        rangeLabel: "\u2014",
        monthsCount: 0,
        daysCount: 0
    });

    useEffect(() => {
        calculateCoverage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expenses])

    const parseDate = (raw) => {
        if (raw == null) return null;
        if (raw instanceof Date) {
            return isNaN(raw.getTime()) ? null : raw;
        }
        if (typeof raw === "number") {
            // Excel serial date
            const utcDays = Math.floor(raw - 25569);
            const utcValue = utcDays * 86400;
            const d = new Date(utcValue * 1000);
            return isNaN(d.getTime()) ? null : d;
        }
        if (typeof raw === "string") {
            const s = raw.trim();
            if (!s) return null;
            // dd/mm/yyyy
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
        const candidates = [e.Date, e.date, e["Date "], e[" date"], e.ExpenseDate, e.expenseDate, e.createdAt, e.Day];
        for (const c of candidates) {
            const d = parseDate(c);
            if (d) return d;
        }
        return null;
    };

    const formatMonthYear = (d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

    const calculateCoverage = () => {
        const list = list_safe(expenses);
        const dates = list.map(getDateValue).filter(Boolean);
        if (!dates.length) {
            setCoverage({
                start: null,
                end: null,
                startLabel: "\u2014",
                endLabel: "\u2014",
                rangeLabel: "\u2014",
                monthsCount: 0,
                daysCount: 0
            });
            return;
        }
        const start = dates.reduce((a, b) => (a < b ? a : b));
        const end = dates.reduce((a, b) => (a > b ? a : b));
        const monthsCount = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        const dayMs = 1000 * 60 * 60 * 24;
        const daysCount = Math.max(0, Math.round((end - start) / dayMs) + 1);
        setCoverage({
            start,
            end,
            startLabel: formatMonthYear(start),
            endLabel: formatMonthYear(end),
            rangeLabel: `${formatMonthYear(start)} \u2013 ${formatMonthYear(end)}`,
            monthsCount,
            daysCount
        });
    };

    return (
        <div id="exCard">
            <div id="word">Coverage Duration</div>
            <div id="actNumber">{coverage.rangeLabel}</div>
            <div id="subExp">
                {coverage.monthsCount > 0
                    ? `${coverage.monthsCount} month${coverage.monthsCount === 1 ? "" : "s"} \u00b7 ${coverage.daysCount} day${coverage.daysCount === 1 ? "" : "s"}`
                    : "No dated records yet"}
            </div>
        </div>
    )
}

function list_safe(value) {
    return Array.isArray(value) ? value : [];
}

export default Cards

