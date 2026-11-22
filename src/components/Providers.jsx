"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AppProvider } from "@/lib/store";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeBridge({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    queueMicrotask(() => {
      const saved = window.localStorage.getItem("mentorlagbe:theme");
      const next = saved === "dark" || saved === "light" ? saved : "light";
      setTheme(next);
      document.documentElement.classList.toggle("dark", next === "dark");
    });
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem("mentorlagbe:theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
      <Toaster position="top-right" richColors closeButton theme={theme} />
    </ThemeContext.Provider>
  );
}

export default function Providers({ children }) {
  return (
    <ThemeBridge>
      <AppProvider>{children}</AppProvider>
    </ThemeBridge>
  );
}
