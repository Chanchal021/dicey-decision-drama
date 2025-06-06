
import { motion } from "framer-motion";
import { Screen } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import UserAuthBar from "./landing/UserAuthBar";
import FloatingElements from "./landing/FloatingElements";
import MouseFollower from "./landing/MouseFollower";
import HeroSection from "./landing/HeroSection";
import FeaturesSection from "./landing/FeaturesSection";
import CTASection from "./landing/CTASection";
import Footer from "./landing/Footer";

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <UserAuthBar user={user} onNavigate={onNavigate} onSignOut={handleSignOut} />

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%,transparent_100%)] bg-[length:60px_60px] animate-pulse"></div>
        <FloatingElements />
      </div>

      <MouseFollower />
      <HeroSection user={user} onNavigate={onNavigate} />
      <FeaturesSection />
      <CTASection user={user} onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

export default LandingPage;
