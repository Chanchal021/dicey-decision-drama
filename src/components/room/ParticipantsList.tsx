
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Room, User } from "@/types";

interface ParticipantsListProps {
  room: Room;
  user: User;
}

const ParticipantsList = ({ room, user }: ParticipantsListProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Participants ({room.participants?.length || 0})
          {room.max_participants && ` / ${room.max_participants}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {room.participants?.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Badge 
                variant={participant.user_id === user.id ? "default" : "secondary"}
                className="text-sm px-3 py-1"
              >
                {participant.user_id === user.id ? `${participant.display_name} (You)` : participant.display_name}
                {room.creator_id === participant.user_id && " 👑"}
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParticipantsList;
