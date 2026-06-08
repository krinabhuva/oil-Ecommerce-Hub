import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiInbox } from "react-icons/fi";

import { useLanguage } from "@/context/LanguageContext";
import { useOilContext } from "@/context/OilContext";
import imageMap from "@/data/imageMap";
import { OIL_PRODUCTS } from "@/data/oils";
import { useColors } from "@/hooks/useColors";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api";
const MESSAGES_KEY = "oil_shop_messages";

interface Message {
  id: number;
  customerName: string | null;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

type Tab = "prices" | "messages";

function loadLocalMessages(): Message[] {
  const raw = localStorage.getItem(MESSAGES_KEY);
  return raw ? (JSON.parse(raw) as Message[]) : [];
}

function saveLocalMessages(messages: Message[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export default function AdminScreen() {
  const colors = useColors();
  const navigate = useNavigate();
  const { prices, updatePrices, changePassword } = useOilContext();
  const { t, lang, toggle } = useLanguage();

  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("prices");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const oil of OIL_PRODUCTS) {
      next[oil.id] = String(prices[oil.id] ?? oil.defaultPrice);
    }
    setLocalPrices(next);
  }, [prices]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/messages`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as Message[];
      setMessages(data);
      setUnreadCount(data.filter((m) => !m.isRead).length);
      saveLocalMessages(data);
    } catch {
      const local = loadLocalMessages();
      setMessages(local);
      setUnreadCount(local.filter((m) => !m.isRead).length);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSave = async () => {
    const parsed: Record<string, number> = {};
    for (const [id, val] of Object.entries(localPrices)) {
      const num = parseInt(val, 10);
      if (Number.isNaN(num) || num <= 0) {
        alert(t("allPricesMustBeValid") || t("invalidPrice") || "All prices must be valid positive numbers.");
        return;
      }
      parsed[id] = num;
    }
    setSaving(true);
    try {
      await updatePrices(parsed);
      alert(t("pricesUpdatedSuccessfully") || t("priceSaved") || "Prices updated successfully.");
    } catch (_err) {
      alert(t("sendFailed") || "Failed to save prices.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPass.length < 4) {
      alert(t("tooShort"));
      return;
    }
    if (newPass !== confirmPass) {
      alert(t("mismatch"));
      return;
    }
    await changePassword(newPass);
    setNewPass("");
    setConfirmPass("");
    alert(t("done"));
  };

  const markRead = async (id: number) => {
    try {
      await fetch(`${API_BASE}/messages/${id}/read`, { method: "PATCH" });
    } catch {
      // Keep local fallback behavior if API is unavailable.
    }
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, isRead: true } : m));
      saveLocalMessages(updated);
      return updated;
    });
    setUnreadCount((n) => Math.max(0, n - 1));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.background }}>
      <header style={{ backgroundColor: colors.primary, padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 18, border: "none", backgroundColor: "rgba(255,255,255,0.2)" }}>
          <FiArrowLeft color="#fff" />
        </button>
        <div style={{ color: "#fff", fontWeight: 700, flex: 1 }}>{t("adminPanel")}</div>
        <button onClick={toggle} style={{ border: "none", background: "transparent", color: "#fff" }}>
          {lang === "en" ? "EN" : "GU"}
        </button>
        {activeTab === "prices" ? (
          <button onClick={handleSave} disabled={saving} style={{ border: "none", borderRadius: 8, padding: "8px 12px" }}>
            {saving ? t("saving") : t("saveAll")}
          </button>
        ) : null}
      </header>

      <div style={{ display: "flex", borderBottom: `1px solid ${colors.border}` }}>
        <button onClick={() => setActiveTab("prices")} style={{ flex: 1, padding: 12, border: "none", backgroundColor: activeTab === "prices" ? colors.card : "transparent" }}>
          {t("prices")}
        </button>
        <button onClick={() => setActiveTab("messages")} style={{ flex: 1, padding: 12, border: "none", backgroundColor: activeTab === "messages" ? colors.card : "transparent" }}>
          {t("messages")} {unreadCount > 0 ? `(${unreadCount})` : ""}
        </button>
      </div>

      <main style={{ padding: 16 }}>
        {activeTab === "prices" ? (
          <>
            <div style={{ backgroundColor: colors.secondary, borderRadius: 10, padding: 10, marginBottom: 12 }}>
              {t("editPriceInfo")}
            </div>

            <div style={{ backgroundColor: colors.card, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 700 }}>{t("changePassword")}</div>
              <input
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder={t("newPassword")}
                type="password"
                style={{ width: "100%", marginBottom: 8, padding: 10 }}
              />
              <input
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder={t("confirmPassword")}
                type="password"
                style={{ width: "100%", marginBottom: 8, padding: 10 }}
              />
              <button onClick={handleChangePassword}>{t("updatePassword")}</button>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {OIL_PRODUCTS.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 8, backgroundColor: colors.card, borderRadius: 10, padding: 8 }}>
                  <img src={imageMap[item.imageKey]} alt={item.name} style={{ width: 60, height: 68, objectFit: "cover" }} />
                  <div>
                    <div style={{ color: colors.mutedForeground, fontSize: 12 }}>{item.brand}</div>
                    <div style={{ fontWeight: 700 }}>{t(item.name)}</div>
                    <div style={{ color: colors.mutedForeground, fontSize: 12 }}>{item.weightKg} kg</div>
                  </div>
                  <input
                    type="number"
                    value={localPrices[item.id] ?? ""}
                    onChange={(e) => setLocalPrices((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    style={{ width: 96, textAlign: "right", padding: 8, borderRadius: 6, border: `1px solid ${colors.border}`, backgroundColor: colors.background, color: colors.text }}
                  />
                </div>
              ))}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: colors.primary,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? t("saving") : (lang === "en" ? "Save Prices" : "ભાવ સાચવો")}
              </button>
            </div>
          </>
        ) : (
          <>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: colors.mutedForeground }}>
                <FiInbox size={44} style={{ marginBottom: 8 }} />
                <div>{t("noMessagesYet")}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {messages.map((m) => (
                  <div key={m.id} style={{ backgroundColor: colors.card, borderRadius: 10, padding: 12, borderLeft: m.isRead ? "none" : `3px solid ${colors.primary}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{m.customerName ?? t("anonymous")}</div>
                        {m.phone ? <div style={{ color: colors.mutedForeground }}>{m.phone}</div> : null}
                      </div>
                      <div style={{ textAlign: "right", color: colors.mutedForeground, fontSize: 12 }}>
                        {new Date(m.createdAt).toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>{m.message}</div>
                    {!m.isRead ? <button onClick={() => markRead(m.id)} style={{ marginTop: 8 }}>{t("markAsRead")}</button> : null}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
