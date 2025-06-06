import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen, User, Room } from "@/types";
import { Plus, Clock, Users, Trophy, ArrowLeft, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
  user: User | null;
  rooms: Room[];
  onNavigate: (screen: Screen) => void;
  onNavigateToRoom: (roomId: string) => void;
}

const Dashboard = ({ user, rooms, onNavigate, onNavigateToRoom }: DashboardProps) => {
  const { toast } = useToast();
  const recentRooms = rooms.filter(room => room.resolved_at).slice(0, 3);

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

  const getFinalChoice = (room: Room) => {
    if (!room.final_option_id || !room.options) return 'Unknown';
    const finalOption = room.options.find(opt => opt.id === room.final_option_id);
    return finalOption?.text || 'Unknown';
  };

  const handleShareRoom = async (room: Room) => {
    const roomLink = `${window.location.origin}?room=${room.code}`;
    
    try {
      await navigator.clipboard.writeText(roomLink);
      toast({
        title: "Room link copied! 🔗",
        description: `Share this link: ${roomLink}`,
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Copy failed",
        description: "Please manually copy the room code: " + room.code,
        variant: "destructive"
      });
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
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate("landing")}
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

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4 mb-12">
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

        {/* Active Rooms */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6">Active Rooms</h2>
          {rooms.filter(room => !room.resolved_at).length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No active rooms</h3>
                <p className="text-gray-500 mb-6">Create a new room to get started!</p>
                <Button
                  onClick={() => onNavigate("create-room")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-6 py-3 rounded-full"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.filter(room => !room.resolved_at).map(room => (
                <motion.div
                  key={room.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => onNavigateToRoom(room.id)}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-800 mb-1">
                            {room.title}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            Code: {room.code}
                          </CardDescription>
                          {room.description && (
                            <CardDescription className="text-gray-500 mt-1">
                              {room.description}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareRoom(room);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{room.room_participants?.length || 0} participants</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(room.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {room.is_voting_active && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🗳️ Voting Active
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Decisions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Recent Decisions</h2>
            {recentRooms.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => onNavigate("past-decisions")}
                className="text-white hover:text-white/80 hover:bg-white/10"
              >
                View All
              </Button>
            )}
          </div>

          {recentRooms.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No decisions yet</h3>
                <p className="text-gray-500">Your completed decisions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentRooms.map(room => (
                <motion.div
                  key={room.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => onNavigate("past-decisions")}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{room.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            <Trophy className="w-4 h-4 inline mr-1" />
                            Winner: {getFinalChoice(room)}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(room.resolved_at || '').toLocaleDateString()}
                            {room.tiebreaker_used && (
                              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                                🎲 Tiebreaker
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareRoom(room);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </Button>
                          <div className="text-2xl">
                            {(room.room_participants?.length || 0) > 5 ? '🎊' : 
                             (room.room_participants?.length || 0) > 3 ? '🎉' : '✨'}
                          </div>
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
