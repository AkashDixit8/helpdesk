import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("helpdesk_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("helpdesk_token");
      localStorage.removeItem("helpdesk_user");
    }
    return Promise.reject(error);
  }
);

export default api;

export const bodyOf = (response) => response?.data || {};
export const listOf = (response, key) => {
  const data = bodyOf(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
};
export const messageOf = (error, fallback = "Something went wrong.") =>
  error?.response?.data?.message || error?.message || fallback;
