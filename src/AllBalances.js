import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import LedgerTable2, { LEDGER_PAGE_SIZE } from './ledge2';

const columns = [
    { key: 'Date', header: 'Date', date: true, search: true },
    { key: 'Amount', header: 'Amount', align: 'center', currency: true, search: true },
    { key: 'Qty', header: 'Qty', align: 'center', numeric: true, search: true, compare: (a, b) => (Number(b.Qty) || 0) - (Number(a.Qty) || 0) },
    { key: 'Debtor', header: 'Debtor', search: true },
    { key: 'Witness', header: 'Witness', search: true },
    { key: 'Location', header: 'Location', search: true },
    { key: 'PaidAmount', header: 'PaidAmount', align: 'center', currency: true},
    { key: 'Status', header: 'Status', badge: true, search: true },
];

const AllBalances = () => {
    const balances = useSelector((state) => state.balances.balances);

    const totals = useMemo(() => {
        const list = Array.isArray(balances) ? balances : [];
        let sum = 0;
        let qty = 0;
        for (const b of list) {
            sum += Number(b.Amount) || 0;
            qty += Number(b.Qty) || 0;
        }
        return { count: list.length, sum, qty };
    }, [balances]);

    return (
        <LedgerTable2
            rows={balances}
            title='All Balances'
            subtitle='Every balance record from the backend'
            searchFields={['Date', 'Amount', 'Qty', 'Debtor', 'Witness', 'Location', 'Status', '_id']}
            categoryField='Status'
            columns={columns}
            summary={[
                { label: '', value: `${totals.count.toLocaleString()} record${totals.count === 1 ? '' : 's'} - ` },
                { label: 'K', value: `${Number(totals.sum).toLocaleString()} total - ` },
                { label: '', value: `${Number(totals.qty).toLocaleString()} units` }
            ]}
        />
    );
};

export default AllBalances;
export { LEDGER_PAGE_SIZE };
