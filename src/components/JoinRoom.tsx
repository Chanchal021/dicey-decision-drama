
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen } from "@/types";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface JoinRoomProps {
  initialRoomCode?: string | null;
  onRoomJoined: (roomCode: string, displayName: string) => void;
  onNavigate: (screen: Screen) => void;
}

const JoinRoom = ({ initialRoomCode, onRoomJoined, onNavigate }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode || "");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-red-600">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                You need to be logged in to join a room. Please log in first.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => onNavigate("login")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Go to Login
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigate("landing")}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = roomCode.trim().toUpperCase();
    const trimmedName = displayName.trim();
    
    if (!trimmedCode || !trimmedName) {
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Submitting join room request:', { roomCode: trimmedCode, displayName: trimmedName });
      await onRoomJoined(trimmedCode, trimmedName);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-purple-600">Join Room</CardTitle>
            <p className="text-gray-600 mt-2">
              Enter the room code to join the decision session! 🎉
            </p>
            {initialRoomCode && (
              <p className="text-sm text-purple-600 mt-2">
                Room code from link: {initialRoomCode}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <Input
                  id="roomCode"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="text-center text-lg font-mono uppercase tracking-widest"
                  maxLength={10}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should others see you?"
                  maxLength={50}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!roomCode.trim() || !displayName.trim() || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-lg"
              >
                {isLoading ? "Joining..." : "Join Room 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinRoom;
