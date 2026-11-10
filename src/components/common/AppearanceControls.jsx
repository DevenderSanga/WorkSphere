
import { Moon, Sun, Languages, AlignLeft, AlignRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "./AppearanceControls.css";

function AppearanceControls() {
  const { theme, direction, toggleTheme, toggleDirection } = useTheme();

  return (
    <div className="appearance-controls">
      <button
        type="button"
        className="appearance-button"
        onClick={toggleTheme}
        title="Change theme"
        aria-label="Change theme"
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        <span>{theme === "light" ? "Dark" : "Light"}</span>
      </button>

      <button
        type="button"
        className="appearance-button"
        onClick={toggleDirection}
        title="Change text direction"
        aria-label="Change text direction"
      >
        {direction === "ltr" ? <AlignLeft size={18} /> : <AlignRight size={18} />}
        <Languages size={16} />
        <span>{direction.toUpperCase()}</span>
      </button>
    </div>
  );
}

export default AppearanceControls;
