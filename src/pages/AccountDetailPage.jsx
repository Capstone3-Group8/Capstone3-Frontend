import { useEffect, useState } from "react";
import { useParams, Link } from 'react-router';
import { getAccount } from "../api/accounts";

export default function AccountDetailPage() {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        let isActive = true;
        getAccount(id)
        .then((data) => isActive && setAccount(data))
        .catch((err) => isActive && setError(err.message));
        return () => {
            isActive = false;
        };
    }, [id]);

    if (error) return <p className='text-red-500'>{error}</p>;
    if (!account) return <p>Loading...</p> //loading 

    return (
        <section>
            <Link to="/accounts" className="text-sm text-(--accent)">
            Back to accounts
            </Link>
            <h1 className="mt-4 text-3xl font-semibold text-(--text-h)">
                {account.name}
            </h1>
            <p className="mt-2">{account.type} - {account.bank_name}</p>
            <p className="mt-4 text-sm">Balance: ${account.balance}</p>
        </section>
    )
    
}