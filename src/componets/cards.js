import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import "./cards.css"

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const parseDate = (raw) => {
    if (raw == null) return null;
    if (raw instanceof Date) {
        return isNaN(raw.getTime()) ? null : raw;
    }
    if (typeof raw === "number") {
        const utcDays = Math.floor(raw - 25569);
        const utcValue = utcDays * 86400;
        const d = new Date(utcValue * 1000);
        return isNaN(d.getTime()) ? null : d;
    }
    if (typeof raw === "string") {
        const s = raw.trim();
        if (!s) return null;
        // dd/mm/yyyy
        const dmy = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})/);
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

const Cards = () => {
    const expenses = useSelector((state) => state.expenses.expenses);
    const taken = useSelector((state) => state.expenses.taken);
    const drums = useSelector((state) => state.expenses.drums);
    const produced = useSelector((state) => state.expenses.produced);

    // Filter controls
    const [filterType, setFilterType] = useState("all"); // 'all', 'month', 'date'
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDate, setSelectedDate] = useState("");

    // Compute distinct months and dates from expenses
    const monthOptions = useMemo(() => {
        const set = new Set();
        const list = Array.isArray(expenses) ? expenses : [];
        list.forEach((e) => {
            const d = parseDate(e.Date);
            if (d) {
                const monthName = MONTHS[d.getMonth()];
                const year = d.getFullYear();
                set.add(`${monthName} ${year}`);
            }
        });
        return ["All", ...Array.from(set).sort()];
    }, [expenses]);

    const dateOptions = useMemo(() => {
        const set = new Set();
        const list = Array.isArray(expenses) ? expenses : [];
        list.forEach((e) => {
            const d = parseDate(e.Date);
            if (d) {
                const str = d.toISOString().split("T")[0]; // YYYY-MM-DD
                set.add(str);
            }
        });
        return ["All", ...Array.from(set).sort()];
    }, [expenses]);

    // Filter function
    const applyFilter = (item) => {
        if (filterType === "all") return true;
        const d = parseDate(item.Date);
        if (!d) return false;
        if (filterType === "month") {
            const monthName = MONTHS[d.getMonth()];
            const year = d.getFullYear();
            return `${monthName} ${year}` === selectedMonth;
        }
        if (filterType === "date") {
            const str = d.toISOString().split("T")[0];
            return str === selectedDate;
        }
        return false;
    };

    const filteredExpenses = useMemo(() => {
        const list = Array.isArray(expenses) ? expenses : [];
        return list.filter(applyFilter);
    }, [expenses, filterType, selectedMonth, selectedDate]);

    const filteredTaken = useMemo(() => {
        const list = Array.isArray(taken) ? taken : [];
        return list.filter(applyFilter);
    }, [taken, filterType, selectedMonth, selectedDate]);

    const filteredDrums = useMemo(() => {
        const list = Array.isArray(drums) ? drums : [];
        return list.filter(applyFilter);
    }, [drums, filterType, selectedMonth, selectedDate]);

    const filteredProduced = useMemo(() => {
        const list = Array.isArray(produced) ? produced : [];
        return list.filter(applyFilter);
    }, [produced, filterType, selectedMonth, selectedDate]);

    // Helper
    const list_safe = (value) => Array.isArray(value) ? value : [];

    return (
        <div id="infoCards">
            <div className="filter-controls">
                <div id="filter-label">
                    <div>Filter by:</div>
                    <select value={filterType} onChange={(e) => {
                        setFilterType(e.target.value);
                        if (e.target.value === "all") {
                            setSelectedMonth("");
                            setSelectedDate("");
                        }
                    }}>
                        <option value="all">All Months</option>
                        <option value="month">Month</option>
                        <option value="date">Date</option>
                    </select>
                </div>
                {filterType === "month" && (
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} >
                        {monthOptions.map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                )}
                {filterType === "date" && (
                    <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} >
                        {dateOptions.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                )}
            </div>
            <div id="cards">
                <TotalExpenseCard expenses={filteredExpenses} />
                <TotalProducedCard produced={filteredProduced} taken={filteredTaken} />
                <TotalTakenCard taken={filteredTaken} />
                <TotalNipsCard takenList={filteredTaken} producedList={filteredProduced} />
                <TotalBigPapersCard takenList={filteredTaken} producedList={filteredProduced} />
                <TotalBigCartonCard takenList={filteredTaken} producedList={filteredProduced} />
                <TotalDrumsCard drums={filteredDrums} />
                <LargetExpense expenses={filteredExpenses} />
                <AverageExpense expenses={filteredExpenses} />
                <TopCategory expenses={filteredExpenses} />
                <Categories expenses={filteredExpenses} />
                {/* <CoverageDuration /> */}
            </div>
        </div>
    )
};

const TotalExpenseCard = ({ expenses }) => {
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let total1 = 0;
        list_safe(expenses).forEach((element) => {
            total1 = total1 + (Number(element.Total) || 0);
        });
        setTotal(total1);
    }, [expenses]);

    return (
        <div id="exCard">
            <div id="word">Total Spend</div>
            <div id="actNumber">K{Number(total).toLocaleString()}.00</div>
            <div id="subExp">{Number(list_safe(expenses).length).toLocaleString()} tracked records</div>
        </div>
    )
};

const TotalTakenCard = ({ taken }) => {
    const [total, setTotal] = useState(0);
    const [totalN, setTotalN] = useState(0);
    const [totalBP, setTotalBP] = useState(0);
    const [totalBC, setTotalBC] = useState(0);

    useEffect(() => {
        let totali = 0;
        let total1 = 0;
        let total2 = 0;
        let total3 = 0;
        list_safe(taken).forEach((element) => {
            totali = totali + (Number(element.Qty) || 0);
        });

        list_safe(taken).forEach((element) => {
            if (element.Category === "Nips") {
                total1 = total1 + (Number(element.Qty) || 0);
            }
            if (element.Category === "Bigs_papers") {
                total2 = total2 + (Number(element.Qty) || 0);
            }
            if (element.Category === "Bigs_cartons") {
                total3 = total3 + (Number(element.Qty) || 0);
            }
        });
        setTotal(totali);
        setTotalN(total1);
        setTotalBP(total2);
        setTotalBC(total3);
    }, [taken])

    return (
        <div id="exCard">
            <div id="word">Total c/s Sold</div>
            <div id="actNumber">{Number(total).toLocaleString()} c/s</div>
            <div id="subExp">Nips:{Number(totalN).toLocaleString()}, B-P:{Number(totalBP).toLocaleString()}, B-C:{Number(totalBC).toLocaleString()}</div>
        </div>
    )
};

const TotalProducedCard = ({ produced, taken }) => {
    const [total, setTotal] = useState(0);
    const [totalN, setTotalN] = useState(0);
    const [totalBP, setTotalBP] = useState(0);
    const [totalBC, setTotalBC] = useState(0);

    useEffect(() => {
        let totali = 0;
        let total1 = 0;
        let total2 = 0;
        let total3 = 0;

        list_safe(taken).forEach((element) => {
            totali = totali + (Number(element.Qty) || 0);
        });

        list_safe(taken).forEach((element) => {
            if (element.Category === "Nips") {
                total1 = total1 + (Number(element.Qty) || 0);
            }
            if (element.Category === "Bigs_papers") {
                total2 = total2 + (Number(element.Qty) || 0);
            }
            if (element.Category === "Bigs_cartons") {
                total3 = total3 + (Number(element.Qty) || 0);
            }
        });

        setTotal(totali);
        setTotalN(total1);
        setTotalBP(total2);
        setTotalBC(total3);
    }, [taken])

    return (
        <div id="exCard">
            <div id="word">Total c/s Produced</div>
            <div id="actNumber">{Number(total).toLocaleString()} C/s</div>
            <div id="subExp">Nips:{Number(totalN).toLocaleString()}, B-P:{Number(totalBP).toLocaleString()}, B-C:{Number(totalBC).toLocaleString()}</div>
        </div>
    )
};

const TotalDrumsCard = ({ drums }) => {
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let total1 = 0;
        list_safe(drums).forEach((element) => {
            total1 = total1 + (Number(element.Qty) || 0);
        });
        setTotal(total1);
    }, [drums])

    return (
        <div id="exCard">
            <div id="word">Total Drums given</div>
            <div id="actNumber">{Number(total).toLocaleString()} drums</div>
            <div id="subExp">{Number(list_safe(drums).length).toLocaleString()} times</div>
        </div>
    )
};

const TotalNipsCard = ({ takenList, producedList }) => {
    const take = list_safe(takenList).reduce((sum, el) => {
        if (el.Category === "Nips") {
            return sum + (Number(el.Qty) || 0);
        }
        return sum;
    }, 0);

    const prod = list_safe(producedList).reduce((sum, el) => {
        if (el.Category === "Nips") {
            return sum + (Number(el.Qty) || 0);
        }
        return sum;
    }, 0);

    const total = prod - take;

    return (
        <div id="exCard">
            <div id="word">Nips c/s remaining</div>
            <div id="actNumber">{total.toLocaleString()} c/s</div>
            <div id="subExp">Prod: {prod} - {take}: Taken</div>
        </div>
    );
};

const TotalBigPapersCard = ({ takenList, producedList }) => {
    const take = list_safe(takenList).reduce((sum, el) => {
        if (el.Category === "Bigs_papers") {
            return sum + (Number(el.Qty) || 0);
        }
        return sum;
    }, 0);

    const prod = list_safe(producedList).reduce((sum, el) => {
        if (el.Category === "Bigs_papers") {
            return sum + (Number(el.Qty) || 0);
        }
        return sum;
    }, 0);

    const total = prod - take;

    return (
        <div id="exCard">
            <div id="word">Big Papers c/s remaining</div>
            <div id="actNumber">{total.toLocaleString()} c/s</div>
            <div id="subExp">Prod: {prod} - {take}: Taken</div>
        </div>
    );
};

const TotalBigCartonCard = ({ takenList, producedList }) => {
    const take = list_safe(takenList).reduce((sum, el) => {
        if (el.Category === "Bigs_cartons") {
            return sum + (Number(el.Qty) || 0);
        }
        return sum;
    }, 0);

    const prod = list_safe(producedList).reduce((sum, el) => {
        if (el.Category === "Bigs_cartons") {
            return sum + (Number(el.Qty) || 0);
        }
        return sum;
    }, 0);

    const total = prod - take;

    return (
        <div id="exCard">
            <div id="word">Big Cartons c/s remaining</div>
            <div id="actNumber">{total.toLocaleString()} c/s</div>
            <div id="subExp">Prod: {prod} - {take}: Taken</div>
        </div>
    );
};

const LargetExpense = ({ expenses }) => {
    const [big, setBig] = useState(0);
    const [low, setLow] = useState(0);

    useEffect(() => {
        const all = list_safe(expenses).map((e) => Number(e.Total) || 0);
        setBig(all.length ? Math.max(...all) : 0);
        setLow(all.length ? Math.min(...all) : 0);
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Largest Expense</div>
            <div id="actNumber">K{Number(big).toLocaleString()}.00</div>
            <div id="subExp">Smallest K{Number(low).toLocaleString()}</div>
        </div>
    )
};

const AverageExpense = ({ expenses }) => {
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
};

const TopCategory = ({ expenses }) => {
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
};

const Categories = ({ expenses }) => {
    const [cats, setCats] = useState([]);

    useEffect(() => {
        const all = [];
        list_safe(expenses).forEach((element) => {
            all.push(element.Category);
        });
        setCats([...new Set(all)]);
    }, [expenses])

    return (
        <div id="exCard">
            <div id="word">Categories</div>
            <div id="actNumber">{Number(cats.length).toLocaleString()}</div>
            <div id="subExp">All expenses</div>
        </div>
    )
};

function list_safe(value) {
    return Array.isArray(value) ? value : [];
}

export default Cards


