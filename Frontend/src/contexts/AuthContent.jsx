import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "../utils/AxiosInstance";

const ACCESS_KEY = "pms_access_token";
const REFRESH_KEY = "pms_refresh_token";
const ROLE_KEY = "pms_user_role";

const AuthContext = createContext(null);

const normalizeRole = (roleLabel) => {
    const roleMap = {
        "Student": "student",
        "TPO / Placement Officer": "tpo",
        "Company / Recruiter": "company",
        "Admin": "admin",
    };
    return roleMap[roleLabel] || "student";
};

const clearAuthStorage = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ROLE_KEY);
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem(ACCESS_KEY) || "");
    const [role, setRole] = useState(localStorage.getItem(ROLE_KEY) || "");
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const bootstrapAuth = async () => {
            const storedAccess = localStorage.getItem(ACCESS_KEY);
            if (!storedAccess) {
                setAuthLoading(false);
                return;
            }

            try {
                const response = await axios.get("/accounts/me/");
                setUser(response.data);
                setToken(storedAccess);
            } catch {
                clearAuthStorage();
                setUser(null);
                setToken("");
                setRole("");
            } finally {
                setAuthLoading(false);
            }
        };

        bootstrapAuth();
    }, []);

    const loginAction = async ({ username, password, role: selectedRole }) => {
        const roleValue = normalizeRole(selectedRole);

        const response = await axios.post("/accounts/login/", {
            username,
            password,
        });

        const res = response.data;
        const access = res?.access;
        const refresh = res?.refresh;

        if (!access || !refresh) {
            throw new Error("Missing access or refresh token.");
        }

        localStorage.setItem(ACCESS_KEY, access);
        localStorage.setItem(REFRESH_KEY, refresh);
        localStorage.setItem(ROLE_KEY, roleValue);

        setToken(access);
        setRole(roleValue);
        setUser({ ...res.user, role: roleValue });
        return res;
    };

    const logOut = async () => {
        const refresh = localStorage.getItem(REFRESH_KEY);

        try {
            if (refresh) {
                await axios.post("/accounts/logout/", { refresh });
            }
        } catch {
            // Ignore logout network errors and clear local state regardless.
        } finally {
            clearAuthStorage();
            setUser(null);
            setToken("");
            setRole("");
        }
    };

    const value = useMemo(
        () => ({
            user,
            token,
            role,
            authLoading,
            isAuthenticated: Boolean(token),
            loginAction,
            logOut,
        }),
        [user, token, role, authLoading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;