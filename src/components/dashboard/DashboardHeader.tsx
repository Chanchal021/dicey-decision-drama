
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Screen } from "@/types";

interface DashboardHeaderProps {
  onNavigate: (screen: Screen) => void;
}

const DashboardHeader = ({ onNavigate }: DashboardHeaderProps) => {
  const handleBackToHome = () => {
    // Clear any current room state when going back to landing
    localStorage.removeItem('diceyDecisions_currentRoomId');
    onNavigate("landing");
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-8"
    >
      <Button
        variant="ghost"
        onClick={handleBackToHome}
        className="mb-4 text-white hover:text-white/80 hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-xl text-white/80">
          Ready to make some decisions?
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
