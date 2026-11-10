
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Work<span>Sphere</span>
          </Link>

          <p>
            Connecting talented freelancers with amazing opportunities.
            Work smarter, grow faster.
          </p>

          <div className="social-links">
            <a href="#facebook" aria-label="Facebook">f</a>
            <a href="#instagram" aria-label="Instagram">◎</a>
            <a href="#linkedin" aria-label="LinkedIn">in</a>
            <a href="#twitter" aria-label="Twitter">𝕏</a>
          </div>
        </div>

        <div className="footer-column">
          <h3>For Freelancers</h3>
          <a href="#categories">Find Projects</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#projects">Browse Categories</a>
        </div>

        <div className="footer-column">
          <h3>For Clients</h3>
          <a href="#projects">Post a Project</a>
          <a href="#categories">Find Talent</a>
          <a href="#how-it-works">Hiring Guide</a>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms & Conditions</a>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 WorkSphere. All rights reserved.</p>
        <p>Made for freelancers and businesses.</p>
      </div>
    </footer>
  );
}

export default Footer;
