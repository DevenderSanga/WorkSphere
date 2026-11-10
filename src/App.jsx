
import { Routes, Route } from "react-router-dom";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";

import FreelancerLayout from "./pages/freelancer/FreelancerLayout";
import FreelancerDashboard from "./pages/freelancer/FreelancerDashboard";
import FreelancerProfile from "./pages/freelancer/FreelancerProfile";
import FindProjects from "./pages/freelancer/FindProjects";
import MyProposals from "./pages/freelancer/MyProposals";
import Messages from "./pages/freelancer/Messages";
import Payments from "./pages/freelancer/Payments";
import Reviews from "./pages/freelancer/Reviews";
import Settings from "./pages/freelancer/Settings";

import ClientLayout from "./pages/client/ClientLayout";
import ClientDashboard from "./pages/client/ClientDashboard";
import PostProject from "./pages/client/PostProject";
import ClientProjects from "./pages/client/ClientProjects";
import ClientProposals from "./pages/client/ClientProposals";
import FindFreelancers from "./pages/client/FindFreelancers";
import ClientMessages from "./pages/client/ClientMessages";
import ClientPayments from "./pages/client/ClientPayments";
import ClientReviews from "./pages/client/ClientReviews";
import ClientSettings from "./pages/client/ClientSettings";

import Notifications from "./pages/shared/Notifications";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Freelancer Dashboard */}
      <Route path="/freelancer" element={<FreelancerLayout />}>
        <Route path="dashboard" element={<FreelancerDashboard />} />
        <Route path="profile" element={<FreelancerProfile />} />
        <Route path="projects" element={<FindProjects />} />
        <Route path="proposals" element={<MyProposals />} />
        <Route path="messages" element={<Messages />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="notifications" element={<Notifications role="freelancer" />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Client Dashboard */}
      <Route path="/client" element={<ClientLayout />}>
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="post-project" element={<PostProject />} />
        <Route path="projects" element={<ClientProjects />} />
        <Route path="proposals" element={<ClientProposals />} />
        <Route path="freelancers" element={<FindFreelancers />} />
        <Route path="messages" element={<ClientMessages />} />
        <Route path="payments" element={<ClientPayments />} />
        <Route path="reviews" element={<ClientReviews />} />
        <Route path="notifications" element={<Notifications role="client" />} />
        <Route path="settings" element={<ClientSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
