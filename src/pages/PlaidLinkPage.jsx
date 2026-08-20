import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken, syncTransactions } from '../api/plaid';

export default function PlaidLinkPage() {
    const [linkToken, setLinkToken] = useState(null);

    useEffect(() => {
        let isActive = true;

        createLinkToken()
            .then((data) => isActive && setLinkToken(data.link_token))
            .catch((err) => isActive && console.error('Failed to get link token:', err.message));

        return () => {
            isActive = false;
        };
    }, []);

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (public_token, metadata) => {
            try {
                const result = await exchangePublicToken(public_token);
                console.log('Exchange successful:', result);
            } catch (error) {
                console.error('Failed to exchange token:', error.message);
            }
        },
    });

    async function handleSyncTransactions(){
        try {
            const result = await syncTransactions();
            console.log('Sync result:', result);
        } catch (error) {
            console.error('Failed to sync transactions:', error.message);
        }
    }

    return (
    <>
        <button onClick={() => open()} disabled ={!ready} className="primary-btn">
            Connect bank account
        </button>
        <button onClick={handleSyncTransactions} className="ml-3 rounded-md border border-(--border) px-4 py-2 font-medium">
            Sync Transactions (test)
        </button>
    </>
    )
}
