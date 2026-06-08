// use localStorage for web
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
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api";

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

function formatUpdateDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_e) {
    return isoString;
  }
}

export function OilProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const defaults: Record<string, number> = {};
    for (const oil of OIL_PRODUCTS) {
      defaults[oil.id] = oil.defaultPrice;
    }
    return defaults;
  });
  const [adminPassword, setAdminPassword] = useState(DEFAULT_PASSWORD);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/prices`);
      if (res.ok) {
        const data = await res.json();
        const { updatedAt, ...productPrices } = data;
        
        const defaults: Record<string, number> = {};
        for (const oil of OIL_PRODUCTS) {
          defaults[oil.id] = oil.defaultPrice;
        }
        
        setPrices({ ...defaults, ...productPrices });
        setLastUpdated(formatUpdateDate(updatedAt));
      }
    } catch (_e) {
      console.error("Failed to fetch prices from API");
    }
  }, []);

  const updatePrices = useCallback(async (newPrices: Record<string, number>) => {
    const res = await fetch(`${API_BASE}/prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPrices),
    });
    if (!res.ok) {
      throw new Error("Failed to update prices");
    }
    const data = await res.json();
    const { updatedAt, ...productPrices } = data;
    
    const defaults: Record<string, number> = {};
    for (const oil of OIL_PRODUCTS) {
      defaults[oil.id] = oil.defaultPrice;
    }
    
    setPrices({ ...defaults, ...productPrices });
    setLastUpdated(formatUpdateDate(updatedAt));
  }, []);

  useEffect(() => {
    fetchPrices();

    // Set up a 5-second periodic poll for live prices auto-update
    const interval = setInterval(fetchPrices, 5000);

    try {
      const storedPassword = localStorage.getItem(PASSWORD_KEY);
      if (storedPassword) setAdminPassword(storedPassword);
    } catch (_e) {}

    return () => clearInterval(interval);
  }, [fetchPrices]);

  const changePassword = useCallback(async (newPassword: string) => {
    setAdminPassword(newPassword);
    try { localStorage.setItem(PASSWORD_KEY, newPassword); } catch (_e) {}
  }, []);

  const checkPassword = useCallback(
    (attempt: string) => attempt === adminPassword,
    [adminPassword]
  );

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

export function useOilContext() {
  const ctx = useContext(OilContext);
  if (!ctx) throw new Error("useOilContext must be used within OilProvider");
  return ctx;
}
