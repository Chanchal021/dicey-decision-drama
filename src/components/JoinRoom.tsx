
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Screen } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface JoinRoomProps {
  onRoomJoined: (roomCode: string, displayName: string) => Promise<void>;
  onNavigate: (screen: Screen) => void;
}

const JoinRoom = ({ onRoomJoined, onNavigate }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !displayName.trim() || !user) return;

    setIsLoading(true);
    try {
      await onRoomJoined(roomCode.trim(), displayName.trim());
    } finally {
      setIsLoading(false);
    }
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
              className="self-start mb-2 text-purple-600 hover:text-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <div className="text-4xl mb-2">🚪</div>
              <CardTitle className="text-2xl font-bold text-purple-600">
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
                <Label htmlFor="displayName" className="text-lg font-semibold">
                  Your Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="How should others see you?"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-lg h-12 mt-1"
                  required
                />
              </div>
              
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
                disabled={roomCode.length !== 6 || !displayName.trim() || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
              >
                {isLoading ? "Joining..." : "Join Room 🎯"}
              </Button>
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
