import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiUnlock } from "react-icons/fi";

import { useLanguage } from "@/context/LanguageContext";
import { useOilContext } from "@/context/OilContext";
import { useColors } from "@/hooks/useColors";

export default function AdminLoginScreen() {
  const colors = useColors();
  const navigate = useNavigate();
  const { checkPassword } = useOilContext();
  const { t, lang, toggle } = useLanguage();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [secure, setSecure] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleLogin = () => {
    if (checkPassword(password)) {
      setError("");
      navigate("/admin", { replace: true });
      return;
    }
    setError(t("incorrectPassword"));
    setPassword("");
    inputRef.current?.focus();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.background }}>
      <div style={{ backgroundColor: colors.primary, padding: 12, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={toggle} style={{ width: 40, height: 40, borderRadius: 20, border: "none", backgroundColor: "rgba(255,255,255,0.2)", color: "#fff" }}>
          {lang === "en" ? "EN" : "GU"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, margin: "0 auto 20px", backgroundColor: colors.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiLock size={32} color={colors.primary} />
          </div>

          <h2 style={{ margin: 0, marginBottom: 8, textAlign: "center", color: colors.text }}>{t("adminAccess")}</h2>
          <p style={{ margin: 0, marginBottom: 24, textAlign: "center", color: colors.mutedForeground }}>{t("enterPassword")}</p>

          <div style={{ position: "relative", marginBottom: 8 }}>
            <input
              ref={inputRef}
              type={secure ? "password" : "text"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              placeholder={t("enterPasswordPlaceholder")}
              autoFocus
              style={{ width: "100%", height: 52, borderRadius: 12, border: `1.5px solid ${error ? colors.destructive : colors.border}`, backgroundColor: colors.card, color: colors.text, padding: "0 48px 0 14px" }}
            />
            <button onClick={() => setSecure((s) => !s)} style={{ position: "absolute", right: 10, top: 10, border: "none", background: "transparent" }}>
              {secure ? <FiEye size={18} color={colors.mutedForeground} /> : <FiEyeOff size={18} color={colors.mutedForeground} />}
            </button>
          </div>

          {error ? <div style={{ color: colors.destructive, marginBottom: 12 }}>{error}</div> : null}

          <button onClick={handleLogin} style={{ width: "100%", height: 52, borderRadius: 12, border: "none", backgroundColor: colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <FiUnlock size={18} />
            {t("login")}
          </button>
        </div>
      </div>
    </div>
  );
}
