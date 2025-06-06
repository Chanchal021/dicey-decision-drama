
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { User as UserType, Screen } from "@/types";

interface UserAuthBarProps {
  user: UserType | null;
  onNavigate: (screen: Screen) => void;
  onSignOut: () => Promise<void>;
}

const UserAuthBar = ({ user, onNavigate, onSignOut }: UserAuthBarProps) => {
  if (!user) return null;

  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-white">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">
            {user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={() => onNavigate("dashboard")}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 h-7"
          >
            Dashboard
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onSignOut}
            className="text-white hover:bg-white/20 text-xs px-2 py-1 h-7"
          >
            <LogOut className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserAuthBar;
