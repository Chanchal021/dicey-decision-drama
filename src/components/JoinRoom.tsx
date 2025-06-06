
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import { Screen } from "@/types";
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
    
    if (!user) {
      return; // This shouldn't happen as we redirect unauthenticated users
    }
    
    if (!roomCode.trim()) return;

    setIsLoading(true);
    try {
      const finalDisplayName = displayName.trim() || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Guest';
      await onRoomJoined(roomCode.trim(), finalDisplayName);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-red-600">Authentication Required</CardTitle>
              <CardDescription className="text-lg">
                You need to be logged in to join a room! 🔐
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                Please log in or create an account to join decision rooms and vote with your friends.
              </p>
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => onNavigate("login")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
                >
                  Login / Sign Up 🚀
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => onNavigate("landing")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back to Home
                </Button>
              </div>
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
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("dashboard")}
              className="absolute left-4 top-4 flex items-center gap-2 text-gray-600 hover:text-purple-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Room
            </CardTitle>
            <CardDescription className="text-lg">
              Enter the room code to join the decision! 🎲
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Room Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter room code (e.g., ABC123)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="text-lg h-12 text-center font-mono tracking-wider"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Display Name (Optional)
                </label>
                <Input
                  type="text"
                  placeholder={`${user.user_metadata?.display_name || user.email?.split('@')[0] || 'Your name'} (default)`}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-lg h-12"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is how others will see you in the room
                </p>
              </div>
            </CardContent>
            <CardContent className="space-y-3 pt-0">
              <Button
                type="submit"
                disabled={isLoading || !roomCode.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
              >
                {isLoading ? "Joining..." : "Join Room! 🎉"}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Don't have a room code? Ask the room creator to share it with you!
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
