
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  UserRound,
  ArrowRight,
} from "lucide-react";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("freelancer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      alert("Please enter your name and email.");
      return;
    }

    const user = {
      name: cleanName,
      email: cleanEmail,
      role,
    };

    // Keep the active login separate in each browser tab.
    sessionStorage.setItem(
      "worksphereUser",
      JSON.stringify(user)
    );

    // Keep separate demo account records for each role.
    if (role === "freelancer") {
      localStorage.setItem(
        "worksphereFreelancerUser",
        JSON.stringify(user)
      );

      navigate("/freelancer/dashboard");
    } else {
      localStorage.setItem(
        "worksphereClientUser",
        JSON.stringify(user)
      );

      navigate("/client/dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-logo">
          Work<span>Sphere</span>
        </Link>

        <h1>Welcome Back!</h1>

        <p className="login-subtitle">
          Sign in to continue to your WorkSphere account.
        </p>

        <form onSubmit={handleLogin}>
          <label>Select your account type</label>

          <div className="role-selection">
            <button
              type="button"
              className={`role-option ${
                role === "freelancer" ? "active" : ""
              }`}
              onClick={() => setRole("freelancer")}
            >
              <UserRound size={22} />
              <span>Freelancer</span>
            </button>

            <button
              type="button"
              className={`role-option ${
                role === "client" ? "active" : ""
              }`}
              onClick={() => setRole("client")}
            >
              <BriefcaseBusiness size={22} />
              <span>Client</span>
            </button>
          </div>

          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="login-submit">
            Login to WorkSphere
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="login-note">
          Demo login only. No password or real authentication is required.
        </p>

        <Link to="/" className="back-home">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Login;
