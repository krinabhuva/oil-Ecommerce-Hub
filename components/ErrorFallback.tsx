import React, { useState } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";

import { useColors } from "@/hooks/useColors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const isDev = Boolean(import.meta.env.DEV);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      window.location.reload();
    } catch (restartError) {
      console.error("Failed to restart app:", restartError);
      resetError();
    }
  };

  const formatErrorDetails = (): string => {
    let details = `Error: ${error.message}\n\n`;
    if (error.stack) {
      details += `Stack Trace:\n${error.stack}`;
    }
    return details;
  };

  const monoFont = "monospace";

  return (
    <div style={{ padding: 24, backgroundColor: colors.background, minHeight: '100vh' }}>
      {isDev ? (
        <button onClick={() => setIsModalVisible(true)} aria-label="View error details" style={{ position: 'absolute', right: 16, top: 16, width:44, height:44, borderRadius:8, backgroundColor: colors.card }}>
          <FiAlertCircle size={20} color={colors.foreground} />
        </button>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, width: '100%', maxWidth: 600 }}>
        <h2 style={{ color: colors.foreground, fontSize: 28, lineHeight: '40px', textAlign: 'center' }}>Something went wrong</h2>
        <p style={{ color: colors.mutedForeground, fontSize: 16, textAlign: 'center' }}>Please reload the app to continue.</p>
        <button onClick={handleRestart} style={{ padding: '12px 24px', backgroundColor: colors.primary, color: colors.primaryForeground, borderRadius: 8, minWidth: 200 }}>
          Try Again
        </button>
      </div>

      {isDev ? (
        isModalVisible ? (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div style={{ width: '100%', height: '90%', borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: colors.background, padding: 16, overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, paddingBottom: 12 }}>
                <h3 style={{ color: colors.foreground, fontSize: 20 }}>Error Details</h3>
                <button onClick={() => setIsModalVisible(false)} style={{ width:44, height:44 }}><FiX size={20} color={colors.foreground} /></button>
              </div>
              <div style={{ padding: 16, backgroundColor: colors.card, borderRadius: 8 }}>
                <pre style={{ color: colors.foreground, fontFamily: monoFont, whiteSpace: 'pre-wrap' }}>{formatErrorDetails()}</pre>
              </div>
            </div>
          </div>
        ) : null
      ) : null}
    </div>
  );
}
// styles converted to inline styles in JSX for web
