import React from "react";

type Props = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export function KeyboardAwareScrollViewCompat({ children, style }: Props) {
  return (
    <div style={{ overflowY: "auto", WebkitOverflowScrolling: "touch", ...style }}>
      {children}
    </div>
  );
}
