
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Room, Screen } from "@/types";

interface RoomHeaderProps {
  room: Room;
  onNavigate?: (screen: Screen) => void;
}

const RoomHeader = ({ room, onNavigate }: RoomHeaderProps) => {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({
      title: "Room code copied! 📋",
      description: "Share this code with others to join the room",
    });
  };

  const handleShareLink = () => {
    const roomLink = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(roomLink);
    toast({
      title: "Room link copied! 🔗",
      description: "Share this link for easy room access",
    });
  };

  const handleShare = async () => {
    const roomLink = `${window.location.origin}?room=${room.code}`;
    const shareData = {
      title: `Join my DiceyDecisions room: ${room.title}`,
      text: `Help me decide! Join my room "${room.title}" to vote on our options.`,
      url: roomLink
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Room shared! 🎉",
          description: "Invitation sent successfully",
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleShareLink(); // Fallback to copying link
        }
      }
    } else {
      handleShareLink(); // Fallback to copying link
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center relative">
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="absolute left-4 top-4 flex items-center gap-2 text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
          
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="text-3xl">🎯</div>
            <CardTitle className="text-2xl font-bold text-purple-600">
              {room.title}
            </CardTitle>
          </div>
          {room.description && (
            <CardDescription className="text-lg">
              {room.description}
            </CardDescription>
          )}
          
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Code: {room.code}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <Button size="sm" variant="outline" onClick={handleCopyCode} className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
            <Button size="sm" onClick={handleShare} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Share2 className="w-4 h-4" />
              Share Room
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            Share the room code or link with others to invite them!
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default RoomHeader;
