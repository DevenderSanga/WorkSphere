
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("worksphereTheme") || "light";
  });

  const [direction, setDirection] = useState(() => {
    return localStorage.getItem("worksphereDirection") || "ltr";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("worksphereTheme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    localStorage.setItem("worksphereDirection", direction);
  }, [direction]);

  const toggleTheme = () => {
    setTheme((current) => current === "light" ? "dark" : "light");
  };

  const toggleDirection = () => {
    setDirection((current) => current === "ltr" ? "rtl" : "ltr");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        direction,
        setTheme,
        setDirection,
        toggleTheme,
        toggleDirection,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
