
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Screen, User } from "@/types";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface CreateRoomData {
  title: string;
  description: string;
  maxParticipants: number;
  options: string[];
}

interface CreateRoomProps {
  user: User | null;
  onRoomCreated: (roomData: CreateRoomData) => Promise<void>;
  onNavigate: (screen: Screen) => void;
}

const CreateRoom = ({ user, onRoomCreated, onNavigate }: CreateRoomProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      return;
    }

    setIsLoading(true);
    try {
      await onRoomCreated({
        title: title.trim(),
        description: description.trim(),
        maxParticipants,
        options: validOptions
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl"
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
                Set up a new decision session for your group
              </CardDescription>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold">
                  Decision Title
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="What are you deciding on?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg h-12 mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-lg font-semibold">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add more context to help participants..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-lg mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="maxParticipants" className="text-lg font-semibold">
                  Max Participants
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="2"
                  max="100"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="text-lg h-12 mt-1"
                />
              </div>

              <div>
                <Label className="text-lg font-semibold">
                  Decision Options
                </Label>
                <div className="space-y-3 mt-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="text-lg h-12"
                        required={index < 2}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-12 w-12 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full h-12 text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Option
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!title.trim() || options.filter(opt => opt.trim()).length < 2 || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
              >
                {isLoading ? "Creating..." : "Create Room 🚀"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateRoom;
