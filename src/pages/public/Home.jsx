
import { Search, ArrowRight, Star, Clock, Briefcase, Users, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./Home.css";

const categories = [
  { icon: "💻", title: "Web Development", count: "1,250+ projects" },
  { icon: "🎨", title: "Graphic Design", count: "850+ projects" },
  { icon: "📱", title: "Mobile Apps", count: "620+ projects" },
  { icon: "✍️", title: "Content Writing", count: "740+ projects" },
  { icon: "📊", title: "Digital Marketing", count: "530+ projects" },
  { icon: "🎬", title: "Video Editing", count: "420+ projects" }
];

const projects = [
  {
    title: "Build a Modern E-commerce Website",
    category: "Web Development",
    budget: "$500 - $1,000",
    duration: "2-3 weeks",
    skills: ["React", "CSS", "JavaScript"],
    proposals: 12
  },
  {
    title: "Create a Professional Brand Identity",
    category: "Graphic Design",
    budget: "$200 - $500",
    duration: "1 week",
    skills: ["Photoshop", "Illustrator", "Figma"],
    proposals: 8
  },
  {
    title: "Mobile Application UI Design",
    category: "UI/UX Design",
    budget: "$300 - $700",
    duration: "2 weeks",
    skills: ["Figma", "UI Design", "Prototyping"],
    proposals: 15
  }
];

function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-container">

            <div className="hero-content">
              <span className="hero-badge">
                <span className="badge-dot"></span>
                The future of freelance work
              </span>

              <h1>
                Find the right talent.
                <span> Build great things.</span>
              </h1>

              <p>
                Connect with skilled freelancers, discover exciting projects,
                and turn your ideas into reality with WorkSphere.
              </p>

              <div className="hero-search">
                <Search size={21} />
                <input
                  type="text"
                  placeholder="Search projects, skills or services..."
                />
                <button>Search</button>
              </div>

              <div className="popular-search">
                <span>Popular:</span>
                <a href="#projects">React</a>
                <a href="#projects">UI/UX Design</a>
                <a href="#projects">Logo Design</a>
              </div>

              <div className="hero-stats">
                <div>
                  <h3>10K+</h3>
                  <span>Freelancers</span>
                </div>
                <div>
                  <h3>5K+</h3>
                  <span>Projects</span>
                </div>
                <div>
                  <h3>98%</h3>
                  <span>Satisfaction</span>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <div className="hero-image-card">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900"
                  alt="Freelancer working on laptop"
                />

                <div className="floating-card floating-top">
                  <div className="floating-icon">✓</div>
                  <div>
                    <strong>Project Completed</strong>
                    <span>Successfully delivered</span>
                  </div>
                </div>

                <div className="floating-card floating-bottom">
                  <div className="avatar">JD</div>
                  <div>
                    <strong>John Davidson</strong>
                    <span>Top Rated Freelancer</span>
                  </div>
                  <Star size={17} fill="#fbbf24" color="#fbbf24" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Categories */}
        <section className="section categories-section" id="categories">
          <div className="section-heading">
            <div>
              <span className="section-label">EXPLORE OPPORTUNITIES</span>
              <h2>Popular Categories</h2>
              <p>Find the perfect service for your next project.</p>
            </div>
            <a href="#projects" className="view-all">
              View all <ArrowRight size={17} />
            </a>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <div className="category-card" key={index}>
                <div className="category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p>{category.count}</p>
                <ArrowRight size={18} className="category-arrow" />
              </div>
            ))}
          </div>
        </section>

        {/* Featured Projects */}
        <section className="section projects-section" id="projects">
          <div className="section-heading">
            <div>
              <span className="section-label">LATEST OPPORTUNITIES</span>
              <h2>Featured Projects</h2>
              <p>Discover projects from clients around the world.</p>
            </div>
            <Link to="/login" className="view-all">
              Browse projects <ArrowRight size={17} />
            </Link>
          </div>

          <div className="project-grid">
            {projects.map((project, index) => (
              <div className="project-card" key={index}>
                <span className="project-category">
                  {project.category}
                </span>

                <h3>{project.title}</h3>

                <div className="project-budget">
                  <strong>{project.budget}</strong>
                  <span>Fixed Price</span>
                </div>

                <div className="project-info">
                  <span><Clock size={15} /> {project.duration}</span>
                  <span><Users size={15} /> {project.proposals} Proposals</span>
                </div>

                <div className="project-skills">
                  {project.skills.map((skill, i) => (
                    <span key={i}>{skill}</span>
                  ))}
                </div>

                <Link to="/login" className="project-link">
                  View Project <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="section how-section" id="how-it-works">
          <div className="section-heading center-heading">
            <span className="section-label">SIMPLE PROCESS</span>
            <h2>How WorkSphere Works</h2>
            <p>Start your freelance journey in three simple steps.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Users size={28} /></div>
              <h3>Create Your Account</h3>
              <p>Join as a freelancer or client and create your professional profile.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><Briefcase size={28} /></div>
              <h3>Find Your Opportunity</h3>
              <p>Explore projects, submit proposals or find the right talent.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><ShieldCheck size={28} /></div>
              <h3>Work & Get Results</h3>
              <p>Manage milestones, complete projects and track payments.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div>
            <span>YOUR NEXT OPPORTUNITY STARTS HERE</span>
            <h2>Ready to grow your freelance career?</h2>
            <p>Join WorkSphere and connect with exciting opportunities.</p>
          </div>
          <Link to="/login" className="cta-button">
            Get Started <ArrowRight size={18} />
          </Link>
        </section>

      </main>

      <Footer />
    </>
  );
}

export default Home;
