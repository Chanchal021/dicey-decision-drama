
import { motion } from "framer-motion";
import { Screen, User, Room } from "@/types";
import DashboardHeader from "./dashboard/DashboardHeader";
import QuickActions from "./dashboard/QuickActions";
import ActiveRooms from "./dashboard/ActiveRooms";
import RecentDecisions from "./dashboard/RecentDecisions";

interface DashboardProps {
  user: User | null;
  rooms: Room[];
  onNavigate: (screen: Screen) => void;
  onNavigateToRoom: (roomId: string) => void;
}

const Dashboard = ({ user, rooms, onNavigate, onNavigateToRoom }: DashboardProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto"
      >
        <DashboardHeader onNavigate={onNavigate} />
        <QuickActions onNavigate={onNavigate} />
        <ActiveRooms 
          rooms={rooms} 
          onNavigate={onNavigate} 
          onNavigateToRoom={onNavigateToRoom} 
        />
        <RecentDecisions rooms={rooms} onNavigate={onNavigate} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
