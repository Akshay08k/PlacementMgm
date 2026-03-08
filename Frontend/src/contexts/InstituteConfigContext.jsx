import { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "../utils/AxiosInstance";

const InstituteConfigContext = createContext(null);

const DEFAULT_CONFIG = {
  name: "Your Institute Name",
  short_name: "",
  logo_url: "",
  support_email: "",
  placement_email: "",
  primary_color: "",
  students_count: "1200+",
  students_every_year: "300+",
  partner_companies: "85+",
  placement_rate: "90%",
  opportunities: "500+",
  address: "",
  contact_phone: "",
};

export const InstituteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/reports/institute-config/public/")
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setConfig({ ...DEFAULT_CONFIG, ...res.data });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refreshConfig = () => {
    axios
      .get("/reports/institute-config/public/")
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setConfig({ ...DEFAULT_CONFIG, ...res.data });
        }
      })
      .catch(() => {});
  };

  const value = useMemo(
    () => ({ config, loading, refreshConfig }),
    [config, loading]
  );

  return (
    <InstituteConfigContext.Provider value={value}>
      {children}
    </InstituteConfigContext.Provider>
  );
};

export const useInstituteConfig = () => {
  const ctx = useContext(InstituteConfigContext);
  if (!ctx) {
    return {
      config: DEFAULT_CONFIG,
      loading: false,
      refreshConfig: () => {},
    };
  }
  return ctx;
};
