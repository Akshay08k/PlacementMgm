import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "../utils/AxiosInstance";

const ACCESS_KEY = "pms_access_token";
const REFRESH_KEY = "pms_refresh_token";
const ROLE_KEY = "pms_user_role";
const MUST_CHANGE_PASSWORD_KEY = "pms_must_change_password";

const AuthContext = createContext(null);

const clearAuthStorage = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(ACCESS_KEY) || "");
  const [role, setRole] = useState(localStorage.getItem(ROLE_KEY) || "");
  const [mustChangePassword, setMustChangePassword] = useState(
    localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) === "true"
  );
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
        const data = response.data;
        setUser(data);
        setToken(storedAccess);
        setRole(data?.role || localStorage.getItem(ROLE_KEY) || "");
        setMustChangePassword(data?.must_change_password === true);
        if (data?.must_change_password) {
          localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "true");
        }
      } catch {
        clearAuthStorage();
        setUser(null);
        setToken("");
        setRole("");
        setMustChangePassword(false);
      } finally {
        setAuthLoading(false);
      }
    };
    bootstrapAuth();
  }, []);

  const loginAction = async ({ email, password, role: selectedRole }) => {
    const response = await axios.post("/accounts/login/", {
      email: email,
      password,
      role: selectedRole || undefined,
    });
    const res = response.data;
    const access = res?.access;
    const refresh = res?.refresh;
    if (!access || !refresh) {
      throw new Error("Missing access or refresh token.");
    }
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(ROLE_KEY, res?.role || res?.user?.role || "student");
    setToken(access);
    setRole(res?.role || res?.user?.role || "student");
    setUser({ ...res.user, role: res?.role || res?.user?.role });
    const mustChange = res?.must_change_password === true;
    setMustChangePassword(mustChange);
    if (mustChange) {
      localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, "true");
    } else {
      localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
    }
    return res;
  };

  const registerStudent = async (data) => {
    const response = await axios.post("/accounts/register/student/", data);
    const res = response.data;
    const access = res?.access;
    const refresh = res?.refresh;
    if (access && refresh) {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
      localStorage.setItem(ROLE_KEY, "student");
      setToken(access);
      setRole("student");
      setUser({ ...res.user, role: "student" });
      setMustChangePassword(false);
    }
    return res;
  };

  const completePasswordChange = () => {
    setMustChangePassword(false);
    localStorage.removeItem(MUST_CHANGE_PASSWORD_KEY);
  };

  const logOut = async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    try {
      if (refresh) {
        await axios.post("/accounts/logout/", { refresh });
      }
    } catch (_) {}
    finally {
      clearAuthStorage();
      setUser(null);
      setToken("");
      setRole("");
      setMustChangePassword(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      mustChangePassword,
      authLoading,
      isAuthenticated: Boolean(token),
      loginAction,
      registerStudent,
      completePasswordChange,
      logOut,
    }),
    [user, token, role, mustChangePassword, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
