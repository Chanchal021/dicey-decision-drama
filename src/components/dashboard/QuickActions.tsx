
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/types";

interface QuickActionsProps {
  onNavigate: (screen: Screen) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="grid md:grid-cols-2 gap-4 mb-12"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all cursor-pointer group"
            onClick={() => onNavigate("create-room")}>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎲</div>
          <h3 className="text-2xl font-bold text-purple-600 mb-2">Create New Room</h3>
          <p className="text-gray-600">Start a new decision session</p>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all cursor-pointer group"
            onClick={() => onNavigate("join-room")}>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🚪</div>
          <h3 className="text-2xl font-bold text-pink-600 mb-2">Join Room</h3>
          <p className="text-gray-600">Enter a room code to join</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickActions;
