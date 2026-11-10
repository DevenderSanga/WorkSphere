
import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";
import "./Navbar.css";
import AppearanceControls from "../common/AppearanceControls";

function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          Work<span>Sphere</span>
        </Link>

        <nav className="nav-links">
          <a href="#categories">Explore</a>
          <a href="#projects">Find Projects</a>
          <a href="#how-it-works">How It Works</a>
        </nav>

        <div className="nav-actions">
             <AppearanceControls />
          <Link to="/login" className="login-btn">
            Login
          </Link>
          <Link to="/login" className="signup-btn">
            Join Now
          </Link>
        </div>

        <button className="mobile-menu">
          <Menu size={24} />
        </button>

      </div>
    </header>
  );
}

export default Navbar;
