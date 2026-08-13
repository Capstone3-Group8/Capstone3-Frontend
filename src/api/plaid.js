import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function createLinkToken() {
    const res = await axios.post(`${BASE_URL}/api/plaid/create-link-token`,{}, // <-- backend will read the user from cookie so no body needed
    {
        withCredentials: true // axios same as fetch credentials: "include"
    });
    return res.data //  { link_token: "...."}
}