import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiLock, FiMessageCircle } from "react-icons/fi";

import { useLanguage } from "@/context/LanguageContext";
import { useOilContext } from "@/context/OilContext";
import imageMap from "@/data/imageMap";
import { OIL_PRODUCTS, OilType } from "@/data/oils";
import { useColors } from "@/hooks/useColors";

type Filter = "All" | OilType;
const FILTERS: Filter[] = ["All", "Groundnut", "Sunflower"];

export default function HomeScreen() {
  const colors = useColors();
  const navigate = useNavigate();
  const { prices, lastUpdated } = useOilContext();
  const { t, lang, toggle } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    if (activeFilter === "All") return OIL_PRODUCTS;
    return OIL_PRODUCTS.filter((o) => o.type === activeFilter);
  }, [activeFilter]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.background }}>
      <header style={{ backgroundColor: colors.primary, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Shree Ram Trading</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{today}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: 18, border: "none", color: "#fff", backgroundColor: "rgba(255,255,255,0.2)" }}>
              {lang === "en" ? "EN" : "GU"}
            </button>
            <button onClick={() => navigate("/admin-login")} style={{ width: 36, height: 36, borderRadius: 18, border: "none", backgroundColor: "rgba(255,255,255,0.2)" }}>
              <FiLock color={colors.primaryForeground} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                backgroundColor: activeFilter === f ? "#fff" : "rgba(255,255,255,0.2)",
                color: activeFilter === f ? colors.primary : "#fff",
              }}
            >
              {f === "All" ? t("all") : f === "Groundnut" ? t("groundnut") : t("sunflower")}
            </button>
          ))}
          <button onClick={() => navigate("/message")} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.15)", color: "#fff" }}>
            <FiMessageCircle style={{ marginRight: 6 }} />
            {t("messageUs")}
          </button>
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {lastUpdated ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 12, borderRadius: 18, padding: "6px 10px", backgroundColor: colors.muted }}>
            <FiClock color={colors.mutedForeground} />
            <span style={{ color: colors.mutedForeground, fontSize: 13 }}>
              {t("updated")} {lastUpdated}
            </span>
          </div>
        ) : null}



        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((item) => {
            const price = prices[item.id] ?? item.defaultPrice;
            const pricePerLtr = (price / item.weightLtr).toFixed(0);
            const isGroundnut = item.type === "Groundnut";
            return (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", borderRadius: 12, overflow: "hidden", backgroundColor: colors.card }}>
                <img src={imageMap[item.imageKey]} alt={item.name} style={{ width: 80, height: 92, objectFit: "cover" }} />
                <div style={{ padding: 10 }}>
                  <div style={{ display: "inline-block", marginBottom: 4, padding: "2px 7px", borderRadius: 4, backgroundColor: isGroundnut ? "#FEF3C7" : "#FEF9C3" }}>
                    {t(item.type)}
                  </div>
                  <div style={{ color: colors.mutedForeground, fontSize: 12 }}>{item.brand}</div>
                  <div style={{ color: colors.text, fontWeight: 700 }}>{t(item.name)}</div>
                  <div style={{ color: colors.mutedForeground, fontSize: 12 }}>
                    {item.weightKg} kg / {item.weightLtr.toFixed(2)} L
                  </div>
                </div>
                <div style={{ minWidth: 96, padding: 10, textAlign: "right", backgroundColor: colors.secondary }}>
                  <div style={{ color: colors.mutedForeground, fontSize: 12 }}>{t("perTin")}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.accent }}>Rs {price.toLocaleString("en-IN")}</div>
                  <div style={{ color: colors.mutedForeground, fontSize: 12 }}>
                    Rs {pricePerLtr}{t("perLiter")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
