import axios from "axios";

const rawApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

// injeta o token JWT em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tripsync_token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// se o token expirar/for inválido, desloga e manda pro login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tripsync_token");
      localStorage.removeItem("tripsync_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;