import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { OIL_PRODUCTS } from "@/data/oils";

const PRICES_KEY = "@oil_shop_prices";
const PASSWORD_KEY = "@oil_shop_password";
const LAST_UPDATED_KEY = "@oil_shop_last_updated";
const DEFAULT_PASSWORD = "1234";

interface OilContextValue {
  prices: Record<string, number>;
  adminPassword: string;
  lastUpdated: string | null;
  updatePrices: (newPrices: Record<string, number>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  checkPassword: (attempt: string) => boolean;
}

const OilContext = createContext<OilContextValue | null>(null);

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

  useEffect(() => {
    async function load() {
      try {
        const [storedPrices, storedPassword, storedUpdated] = await Promise.all(
          [
            AsyncStorage.getItem(PRICES_KEY),
            AsyncStorage.getItem(PASSWORD_KEY),
            AsyncStorage.getItem(LAST_UPDATED_KEY),
          ]
        );

        if (storedPrices) {
          const parsed = JSON.parse(storedPrices) as Record<string, number>;
          const defaults: Record<string, number> = {};
          for (const oil of OIL_PRODUCTS) {
            defaults[oil.id] = oil.defaultPrice;
          }
          setPrices({ ...defaults, ...parsed });
        }
        if (storedPassword) setAdminPassword(storedPassword);
        if (storedUpdated) setLastUpdated(storedUpdated);
      } catch (_e) {}
    }
    load();
  }, []);

  const updatePrices = useCallback(async (newPrices: Record<string, number>) => {
    const now = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setPrices(newPrices);
    setLastUpdated(now);
    await Promise.all([
      AsyncStorage.setItem(PRICES_KEY, JSON.stringify(newPrices)),
      AsyncStorage.setItem(LAST_UPDATED_KEY, now),
    ]);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    setAdminPassword(newPassword);
    await AsyncStorage.setItem(PASSWORD_KEY, newPassword);
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
