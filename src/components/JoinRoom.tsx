
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Screen, User, Room } from "@/pages/Index";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JoinRoomProps {
  user: User | null;
  rooms: Room[];
  onRoomJoined: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const JoinRoom = ({ user, rooms, onRoomJoined, onNavigate }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !user) return;

    console.log("Looking for room with code:", roomCode.trim());
    console.log("Available rooms:", rooms);
    console.log("Room codes:", rooms.map(r => r.code));

    const room = rooms.find(r => r.code.toLowerCase() === roomCode.trim().toLowerCase());
    
    if (!room) {
      toast({
        title: "Room not found 😕",
        description: `No room found with code "${roomCode}". Available rooms: ${rooms.length}`,
        variant: "destructive"
      });
      return;
    }

    if (room.maxParticipants && room.participants.length >= room.maxParticipants) {
      toast({
        title: "Room is full 🚪",
        description: "This room has reached its participant limit",
        variant: "destructive"
      });
      return;
    }

    if (!room.participants.includes(user.name)) {
      room.participants.push(user.name);
    }

    toast({
      title: "Joined successfully! 🎉",
      description: `Welcome to ${room.title}`,
    });
    
    onRoomJoined(room);
  };

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
              className="self-start mb-2 text-google-blue hover:text-google-blue/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <div className="text-4xl mb-2">🚪</div>
              <CardTitle className="text-2xl font-bold text-google-blue">
                Join Room
              </CardTitle>
              <CardDescription className="text-lg">
                Enter the room code to join the decision session
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="roomCode" className="text-lg font-semibold">
                  Room Code
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="text-lg h-12 mt-1 text-center font-bold tracking-wider"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={roomCode.length !== 6}
                className="w-full bg-gradient-to-r from-google-blue to-google-red hover:from-google-blue/90 hover:to-google-red/90 text-white font-bold text-lg h-12 rounded-full"
              >
                Join Room 🎯
              </Button>

              {rooms.length > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Debug: {rooms.length} room(s) available
                  <br />
                  Codes: {rooms.map(r => r.code).join(", ")}
                </div>
              )}
            </CardContent>
          </form>

          <CardContent className="pt-0">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Or click on a shared invite link
              </p>
              <div className="text-2xl">📱</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
