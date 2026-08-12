import { useEffect, useState } from "react";
import { useParams, Link } from 'react-router';
import { getTransaction } from "../api/transactions";

export default function TransactionDetailPage() {
    const { id } = useParams();
    const [transaction, settransaction] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        let isActive = true;
        getAccount(id)
        .then((data) => isActive && setTransaction(data))
        .catch((err) => isActive && setError(err.message));
        return () => {
            isActive = false;
        };
    }, [id]);

    if (error) return <p className='text-red-500'>{error}</p>;
    if (!transaction) return <p>Loading...</p> //loading 

    return (
        <section>
            <Link to="/transactions" className="text-sm text-(--accent)">
            Back to transactions
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-(--text-h)">
                {transaction.id}
            </h1>
            <p className="mt-2">{transaction.account_id} - {transaction.category_id}</p>
            <p className="mt-4 text-sm">Amount: ${transaction.amount}</p>
            <p className="mt-4 text-sm">{transaction.type}</p>
            <p className="mt-4 text-sm">Occured on: ${transaction.date}</p>
            <p className="mt-4 text-sm">Description: ${transaction.Description}</p>
        </section>
    )
    
}