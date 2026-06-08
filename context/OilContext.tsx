import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { OIL_PRODUCTS } from "@/data/oils";

const PASSWORD_KEY = "@oil_shop_password";
const DEFAULT_PASSWORD = "1234";
const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

interface OilContextValue {
  prices: Record<string, number>;
  adminPassword: string;
  lastUpdated: string | null;
  fetchPrices: () => Promise<void>;
  updatePrices: (newPrices: Record<string, number>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  checkPassword: (attempt: string) => boolean;
}

const OilContext = createContext<OilContextValue | null>(null);

/* ---------------- HELPERS ---------------- */

function getDefaultPrices(): Record<string, number> {
  const defaults: Record<string, number> = {};
  for (const oil of OIL_PRODUCTS) {
    defaults[oil.id] = oil.defaultPrice;
  }
  return defaults;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-IN");
  } catch {
    return iso;
  }
}

/* ---------------- PROVIDER ---------------- */

export function OilProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, number>>(
    getDefaultPrices()
  );

  const [adminPassword, setAdminPassword] = useState(DEFAULT_PASSWORD);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  /* ---------------- FETCH PRICES ---------------- */

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/prices`);

      if (!res.ok) return;

      const data = await res.json();

      const { updatedAt, ...apiPrices } = data || {};

      // merge safely
      setPrices({
        ...getDefaultPrices(),
        ...apiPrices,
      });

      setLastUpdated(formatDate(updatedAt));
    } catch (err) {
      console.error("fetchPrices failed:", err);
    }
  }, []);

  /* ---------------- UPDATE PRICES ---------------- */

  const updatePrices = useCallback(async (newPrices: Record<string, number>) => {
    try {
      const res = await fetch(`${API_BASE}/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrices),
      });

      if (!res.ok) throw new Error("Failed to update prices");

      const data = await res.json();
      const { updatedAt, ...apiPrices } = data || {};

      setPrices({
        ...getDefaultPrices(),
        ...apiPrices,
      });

      setLastUpdated(formatDate(updatedAt));
    } catch (err) {
      console.error("updatePrices failed:", err);
      throw err;
    }
  }, []);

  /* ---------------- INIT + POLLING ---------------- */

  useEffect(() => {
    fetchPrices();

    const interval = setInterval(() => {
      fetchPrices();
    }, 10000); // 🔥 safer than 5s (reduces Render/API load)

    try {
      const stored = localStorage.getItem(PASSWORD_KEY);
      if (stored) setAdminPassword(stored);
    } catch {}

    return () => clearInterval(interval);
  }, [fetchPrices]);

  /* ---------------- PASSWORD ---------------- */

  const changePassword = useCallback(async (newPassword: string) => {
    setAdminPassword(newPassword);
    try {
      localStorage.setItem(PASSWORD_KEY, newPassword);
    } catch {}
  }, []);

  const checkPassword = useCallback(
    (attempt: string) => attempt === adminPassword,
    [adminPassword]
  );

  /* ---------------- PROVIDER ---------------- */

  return (
    <OilContext.Provider
      value={{
        prices,
        adminPassword,
        lastUpdated,
        fetchPrices,
        updatePrices,
        changePassword,
        checkPassword,
      }}
    >
      {children}
    </OilContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useOilContext() {
  const ctx = useContext(OilContext);
  if (!ctx) throw new Error("useOilContext must be used within OilProvider");
  return ctx;
}