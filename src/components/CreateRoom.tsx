
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Screen, User, Room } from "@/pages/Index";
import { ArrowLeft, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateRoomProps {
  user: User | null;
  onRoomCreated: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const CreateRoom = ({ user, onRoomCreated, onNavigate }: CreateRoomProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const { toast } = useToast();

  const generateRoomCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const roomCode = generateRoomCode();
    const room: Room = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim() || undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      code: roomCode,
      creator: user.id,
      participants: [user.name],
      options: [],
      votes: {},
      isVotingActive: false,
      createdAt: new Date()
    };

    setCreatedRoom(room);
  };

  const handleCopyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.code);
      toast({
        title: "Copied! 📋",
        description: "Room code copied to clipboard",
      });
    }
  };

  const handleCopyLink = () => {
    if (createdRoom) {
      const link = `${window.location.origin}?room=${createdRoom.code}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copied! 🔗",
        description: "Share this link with your friends",
      });
    }
  };

  const handleJoinRoom = () => {
    if (createdRoom) {
      onRoomCreated(createdRoom);
    }
  };

  if (createdRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <CardTitle className="text-3xl font-bold text-green-600">
                Room Created!
              </CardTitle>
              <CardDescription className="text-lg">
                Share the code with your friends to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Label className="text-lg font-semibold text-gray-700">Room Code</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex-1 text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-wider">
                      {createdRoom.code}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="h-12"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>

              <Button
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-lg h-12 rounded-full"
              >
                Enter Room 🚪
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => onNavigate("dashboard")}
              className="self-start mb-2 text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <div className="text-4xl mb-2">🎲</div>
              <CardTitle className="text-2xl font-bold text-purple-600">
                Create New Room
              </CardTitle>
              <CardDescription className="text-lg">
                Set up a decision session for your group!
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold">
                  Room Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="What are we deciding?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg h-12 mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-lg font-semibold">
                  Description (optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add some context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="maxParticipants" className="text-lg font-semibold">
                  Max Participants (optional)
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="text-lg h-12 mt-1"
                  min="2"
                  max="50"
                />
              </div>
            </CardContent>
            <CardContent>
              <Button
                type="submit"
                disabled={!title.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
              >
                Create Room 🚀
              </Button>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateRoom;
