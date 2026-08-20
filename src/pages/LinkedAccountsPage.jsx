import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getPlaidAccounts, getPlaidTransactions } from '../api/plaid';


export default function LinkedAccountsPage() {
    const[ accounts, setAccounts ] = useState([]);
    const[ transactions, setTransactions ] = useState([]);
    const[ loading, setLoading ] = useState(true);
    const[ error, setError ] = useState(null);
    const[ selectAccountId, setSelectAccountId] = useState(null);

    useEffect(() => {
        let isActive = true;

        Promise.all([getPlaidAccounts(), getPlaidTransactions()])
            .then(([accountsData, transactionsData]) => {
                if(!isActive) {return};
                setAccounts(accountsData);
                setTransactions(transactionsData);
                 if(accountsData.length > 0){
                    setSelectAccountId(accountsData[0].account_id)
                 }
            })
            .catch((err) => isActive && setError(err.message))
            .finally(() => isActive && setLoading(false));
        return () => {
            isActive = false
        };
    }, []);

    if (loading) return <p>Loading linked accounts...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <section>
            <h1 className="mb-2 text-3xl font-semibold text-(--text-h)">
                Linked Bank Accounts
            </h1>
            <p className="mb-6 text-sm text-(-text-muted)">
                Data pulled from your linked bank via Plaid
            </p>

            <Link
                to="/link-bank"
                className="mb-6 inline-block rounded-md bg-(--accent) px-4 py-2 font-medium text-white"
            >
                + Link another account
            </Link>

            <h2 className="mb-3 mt-6 text-xl font-semibold text-(--text-h)">
                Accounts
            </h2>
            {accounts.length === 0 ? (
                <p>No linked accounts</p>
            ) : (
                <ul className='flex flex-col gap-2'>
                    {accounts.map((account) => (
                        <li
                            key={account.id}
                            className="flex items-center justify-between rounded-md border-(--border) px-4 py-3"                       >
                            <span>
                                {account.name} ({account.subtype}) - ****{account.mask}
                            </span>
                            <span className='font-medium'>
                                ${account.current_balance}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <h2 className='mb-3 mt-8 text-xl font-semibold text-(--text-h)'>
                Transactions
            </h2>
            {transactions.length === 0 ? (
                <p>No transactions synced</p>
            ) : (
                <ul className='flex flex-col gap-2'>
                    {transactions.map((transaction) => (
                        <li
                            key={transaction.id}
                            className='flex items-center justify-between rounded-md border border-(--border) px-4 py-3'
                        >
                            <span>
                                {transaction.name}
                                {transaction.category ? ` - ${transaction.category}` : ''}
                                {' - '}
                                {transaction.date}
                            </span>
                            <span className='font-medium'>${transaction.amount}</span>
                        </li>
                    ))}
                </ul>
            )}

        </section>
    )

}