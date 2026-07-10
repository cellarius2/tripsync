import axios from "axios";

const rawApiUrl =
    import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const normalizedApiUrl = rawApiUrl.replace(/\/$/, "");

const baseURL = normalizedApiUrl.endsWith("/api")
    ? normalizedApiUrl
    : `${normalizedApiUrl}/api`;

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("tripsync_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;