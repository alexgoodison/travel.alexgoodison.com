"use client";

import { useEffect, useState } from "react";

type ShuffleTextProps = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
};

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function ShuffleText({
  text,
  className = "",
  style,
}: ShuffleTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!text) return;
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((_, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join(""),
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }

      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className={className} style={style}>
      {displayText}
    </span>
  );
}
