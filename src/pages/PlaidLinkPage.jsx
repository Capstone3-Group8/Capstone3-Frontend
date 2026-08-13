import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken } from '../api/plaid';

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

    const { open, ready } =usePlaidLink({
        token: linkToken,
        onSuccess: (public_token, metadata) => {
            console.log('Plaid Link success: public_token:', public_token, metadata);
        },
    });

    return (
        <button onClick={() => open()} disabled ={!ready} className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white">
            Connect bank account
        </button>
    )
}
