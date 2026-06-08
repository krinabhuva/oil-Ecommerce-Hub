import { Link } from "react-router-dom";
import { useColors } from "@/hooks/useColors";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.background }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: colors.foreground }}>This screen does not exist.</div>
      <Link to="/" style={{ marginTop: 15, padding: 15, display: 'inline-block' }}>
        <div style={{ fontSize: 14, color: colors.primary }}>Go to home screen</div>
      </Link>
    </div>
  );
}
