import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiMessageCircle, FiSend } from "react-icons/fi";

import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const MESSAGES_KEY = "oil_shop_messages";

function saveMessageLocally(payload: { customerName?: string; phone?: string; message: string }) {
  const raw = localStorage.getItem(MESSAGES_KEY);
  const existing = raw ? (JSON.parse(raw) as Array<unknown>) : [];
  const next = [
    ...existing,
    {
      id: Date.now(),
      customerName: payload.customerName || null,
      phone: payload.phone || null,
      message: payload.message,
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));
}

export default function MessageScreen() {
  const colors = useColors();
  const navigate = useNavigate();
  const { t, lang, toggle } = useLanguage();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!message.trim()) {
      setError(t("writeMessageError"));
      return;
    }

    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim() || undefined,
          phone: phone.trim() || undefined,
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      try {
        saveMessageLocally({
          customerName: name.trim() || undefined,
          phone: phone.trim() || undefined,
          message: message.trim(),
        });
        setSent(true);
      } catch {
        setError(t("sendFailed"));
      }
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: colors.background }}>
        <Header colors={colors} lang={lang} toggle={toggle} title={t("messageShopkeeper")} onBack={() => navigate(-1)} />
        <div style={{ padding: 24, textAlign: "center" }}>
          <FiCheckCircle size={56} color={colors.success} />
          <h2 style={{ color: colors.text }}>{t("messageSentTitle")}</h2>
          <p style={{ color: colors.mutedForeground }}>{t("messageSentSubtitle")}</p>
          <button onClick={() => navigate(-1)} style={{ border: "none", borderRadius: 10, padding: "10px 16px", backgroundColor: colors.primary, color: "#fff" }}>
            {t("backToBoard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.background }}>
      <Header colors={colors} lang={lang} toggle={toggle} title={t("messageShopkeeper")} onBack={() => navigate(-1)} />

      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: colors.secondary }}>
          <FiMessageCircle color={colors.accent} />
          <div style={{ color: colors.accent }}>{t("inputPlaceholderMessage")}</div>
        </div>

        <div style={{ marginBottom: 6, color: colors.text }}>{t("yourName")}</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("inputPlaceholderName")} style={{ width: "100%", padding: 10, marginBottom: 12 }} />

        <div style={{ marginBottom: 6, color: colors.text }}>{t("phoneNumber")}</div>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("inputPlaceholderPhone")} style={{ width: "100%", padding: 10, marginBottom: 12 }} />

        <div style={{ marginBottom: 6, color: colors.text }}>{t("messageLabel")}</div>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (error) setError("");
          }}
          rows={5}
          placeholder={t("inputPlaceholderMessage")}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />

        <div style={{ textAlign: "right", color: colors.mutedForeground, marginBottom: 10 }}>{message.length}/1000</div>

        {error ? (
          <div style={{ color: colors.destructive, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <FiAlertCircle size={14} /> {error}
          </div>
        ) : null}

        <button onClick={handleSend} disabled={sending} style={{ width: "100%", border: "none", borderRadius: 10, padding: "12px 16px", backgroundColor: colors.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <FiSend size={16} />
          {sending ? t("sending") : t("sendMessage")}
        </button>
      </div>
    </div>
  );
}

function Header({ colors, lang, toggle, title, onBack }: { colors: ReturnType<typeof useColors>; lang: string; toggle: () => void; title: string; onBack: () => void }) {
  return (
    <div style={{ backgroundColor: colors.primary, padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, border: "none", backgroundColor: "rgba(255,255,255,0.2)" }}>
        <FiArrowLeft color="#fff" />
      </button>
      <div style={{ color: "#fff", fontWeight: 700, flex: 1 }}>{title}</div>
      <button onClick={toggle} style={{ border: "none", background: "transparent", color: "#fff" }}>
        {lang === "en" ? "EN" : "GU"}
      </button>
    </div>
  );
}
