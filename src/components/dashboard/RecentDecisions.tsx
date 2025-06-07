
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Trophy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Screen, Room } from "@/types";

interface RecentDecisionsProps {
  rooms: Room[];
  onNavigate: (screen: Screen) => void;
}

const RecentDecisions = ({ rooms, onNavigate }: RecentDecisionsProps) => {
  const { toast } = useToast();
  const recentRooms = rooms.filter(room => room.resolved_at).slice(0, 3);

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
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
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
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
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
  );
};

export default RecentDecisions;
