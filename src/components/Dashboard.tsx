
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen, User, Room } from "@/pages/Index";
import { Plus, Clock, Users, Trophy } from "lucide-react";

interface DashboardProps {
  user: User | null;
  rooms: Room[];
  onNavigate: (screen: Screen) => void;
}

const Dashboard = ({ user, rooms, onNavigate }: DashboardProps) => {
  const recentRooms = rooms.filter(room => room.resolvedAt).slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
            Hey {user?.name}! 👋
          </h1>
          <p className="text-xl text-white/80">
            Ready to make some decisions? Let's get this party started! 🎉
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group"
                onClick={() => onNavigate("create-room")}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-google-green to-google-blue rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-google-green">Create New Room</CardTitle>
              <CardDescription className="text-lg">
                Start a new decision session with your friends! 🎲
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group"
                onClick={() => onNavigate("join-room")}>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-google-blue to-google-red rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-google-blue">Join Room</CardTitle>
              <CardDescription className="text-lg">
                Got a room code? Jump in and start voting! 🗳️
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Recent Decisions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <Clock className="w-8 h-8 mr-3" />
              Recent Decisions
            </h2>
            {recentRooms.length > 0 && (
              <Button
                variant="outline"
                onClick={() => onNavigate("past-decisions")}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                View All
              </Button>
            )}
          </div>

          {recentRooms.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No decisions yet!</h3>
                <p className="text-gray-500 text-lg">
                  Create your first room and start making some group decisions!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{room.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Trophy className="w-4 h-4 mr-1 text-google-yellow" />
                              {room.finalChoice}
                            </span>
                            <span>{room.resolvedAt?.toLocaleDateString()}</span>
                            {room.tiebreakerUsed && (
                              <span className="flex items-center bg-gradient-to-r from-google-blue/10 to-google-red/10 px-2 py-1 rounded-full">
                                {room.tiebreakerUsed === 'dice' && '🎲'}
                                {room.tiebreakerUsed === 'coin' && '🪙'}
                                {room.tiebreakerUsed === 'spinner' && '🎡'}
                                Tiebreaker
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-2xl">
                          {room.participants.length > 5 ? '🎊' : 
                           room.participants.length > 3 ? '🎉' : '✨'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
