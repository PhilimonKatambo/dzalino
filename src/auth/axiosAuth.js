import axios from "axios";
import { readToken } from "./storage";

// Attach the stored JWT as a Bearer token on every outgoing request, and
// also forward the legacy authorization header that the existing backend
// routes already expect. If the token is missing we leave the legacy header
// in place so the app still works in dev before login.
export function installAxiosAuth() {
    axios.interceptors.request.use((config) => {
        const token = readToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
}