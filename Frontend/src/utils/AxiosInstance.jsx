import axios from "axios";

const ACCESS_KEY = "pms_access_token";
const REFRESH_KEY = "pms_refresh_token";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

let refreshPromise = null;

const clearTokensAndRedirect = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("pms_user_role");
    if (window.location.pathname !== "/signin") {
        window.location.href = "/signin";
    }
};

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_KEY);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If we're sending FormData (file upload), don't force JSON content-type.
        // Axios/Vite will set the correct multipart boundary automatically.
        if (typeof FormData !== "undefined" && config?.data instanceof FormData) {
            try {
                if (config.headers?.set) {
                    config.headers.delete?.("Content-Type");
                } else if (config.headers) {
                    delete config.headers["Content-Type"];
                    delete config.headers["content-type"];
                }
            } catch (_) {}
        }

        return config;
    },
    (error) => Promise.reject(error)
);


instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (
            status === 401 &&
            !originalRequest?._retry &&
            !originalRequest?.url?.includes("/accounts/login/") &&
            !originalRequest?.url?.includes("/accounts/token/refresh/")
        ) {
            const refresh = localStorage.getItem(REFRESH_KEY);

            if (!refresh) {
                clearTokensAndRedirect();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                if (!refreshPromise) {
                    refreshPromise = axios
                        .post(`${API_BASE_URL}/accounts/token/refresh/`, { refresh })
                        .then((res) => {
                            const newAccess = res.data?.access;
                            const newRefresh = res.data?.refresh;

                            if (!newAccess) {
                                throw new Error("Token refresh response missing access token.");
                            }

                            localStorage.setItem(ACCESS_KEY, newAccess);
                            if (newRefresh) {
                                localStorage.setItem(REFRESH_KEY, newRefresh);
                            }
                            return newAccess;
                        })
                        .finally(() => {
                            refreshPromise = null;
                        });
                }

                const newAccessToken = await refreshPromise;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return instance(originalRequest);
            } catch (refreshError) {
                clearTokensAndRedirect();
                return Promise.reject(refreshError);
            }
        }

        if (status === 401) {
            clearTokensAndRedirect();
        }

        return Promise.reject(error);
    }
);

export default instance;
