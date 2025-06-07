
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Clock, Users, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Screen, Room } from "@/types";

interface ActiveRoomsProps {
  rooms: Room[];
  onNavigate: (screen: Screen) => void;
  onNavigateToRoom: (roomId: string) => void;
}

const ActiveRooms = ({ rooms, onNavigate, onNavigateToRoom }: ActiveRoomsProps) => {
  const { toast } = useToast();
  const activeRooms = rooms.filter(room => !room.resolved_at);

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
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-12"
    >
      <h2 className="text-3xl font-bold text-white mb-6">Active Rooms</h2>
      {activeRooms.length === 0 ? (
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
          {activeRooms.map(room => (
            <motion.div
              key={room.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
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
  );
};

export default ActiveRooms;
