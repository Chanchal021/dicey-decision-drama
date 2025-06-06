import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Screen, User } from "@/types";
import { ArrowLeft } from "lucide-react";

interface CreateRoomProps {
  user: User | null;
  onRoomCreated: (roomData: {
    title: string;
    description?: string;
    options: string[];
    maxParticipants?: number;
  }) => Promise<void>;
  onNavigate: (screen: Screen) => void;
}

const CreateRoom = ({ user, onRoomCreated, onNavigate }: CreateRoomProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRoomCreated({
        title: title.trim(),
        description: description.trim() || undefined,
        options: [],
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined
      });
    } finally {
      setIsSubmitting(false);
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
                disabled={!title.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
              >
                {isSubmitting ? "Creating..." : "Create Room 🚀"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateRoom;
