
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import "./Navbar.css";
import AppearanceControls from "../common/AppearanceControls";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo" onClick={closeMenu}>
          Work<span>Sphere</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          <a href="#categories" onClick={closeMenu}>
            Explore
          </a>

          <a href="#projects" onClick={closeMenu}>
            Find Projects
          </a>

          <a href="#how-it-works" onClick={closeMenu}>
            How It Works
          </a>
        </nav>

        <div className={`nav-actions ${menuOpen ? "nav-actions-open" : ""}`}>
          <AppearanceControls />

          <Link to="/login" className="login-btn" onClick={closeMenu}>
            Login
          </Link>

          <Link to="/login" className="signup-btn" onClick={closeMenu}>
            Join Now
          </Link>
        </div>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          type="button"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>
    </header>
  );
}

export default Navbar;
