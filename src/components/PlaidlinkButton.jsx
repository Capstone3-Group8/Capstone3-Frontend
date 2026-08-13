import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

export default function PlaidLinkButton() {
  const [linkToken, setLinkToken] = useState(null);

  // STEP 1: Get link token from backend
  useEffect(() => {
    async function fetchLinkToken() {
      const res = await fetch("http://localhost:8080/api/plaid/create-link-token", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      setLinkToken(data.link_token);
    }

    fetchLinkToken();
  }, []);

  // STEP 2: Initialize Plaid Link
  const config = {
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      console.log("Public Token:", public_token);
      console.log("Metadata:", metadata);

      // STEP 3: Send public_token to backend
      const res = await fetch("http://localhost:8080/api/plaid/exchange-public-token", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });

      const data = await res.json();
      console.log("Exchange Response:", data);

      alert("Bank account connected!");
    },
  };

  const { open, ready } = usePlaidLink(config);

  if (!linkToken) return <p>Loading Plaid...</p>;

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Connect Bank Account
    </button>
  );
}
