
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Screen, User, Room } from "@/types";
import { Users, Plus, X, Play, Copy, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RoomLobbyProps {
  room: Room | null;
  user: User | null;
  onRoomUpdated: (room: Room) => void;
  onNavigate: (screen: Screen) => void;
}

const RoomLobby = ({ room, user, onRoomUpdated, onNavigate }: RoomLobbyProps) => {
  const [newOption, setNewOption] = useState("");
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!room || !user) return null;

  const isCreator = room.creator_id === user.id;
  const roomOptions = room.room_options || [];

  const handleAddOption = async () => {
    if (!newOption.trim() || isSubmitting) return;
    
    if (room.is_voting_active) {
      toast({
        title: "Cannot add options",
        description: "Voting is already active",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get user profile for display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const newRoomOption = {
        id: crypto.randomUUID(),
        text: newOption.trim(),
        submitted_by: user.id,
        submitted_at: new Date().toISOString()
      };

      const updatedOptions = [...roomOptions, newRoomOption];
      
      const { error } = await supabase
        .from('rooms')
        .update({ 
          room_options: updatedOptions,
          options: updatedOptions.map(opt => opt.text) // Keep backward compatibility
        })
        .eq('id', room.id);

      if (error) {
        toast({
          title: "Failed to add option",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setNewOption("");
      toast({
        title: "Option added! ✅",
        description: newOption.trim(),
      });
    } catch (error) {
      console.error('Error adding option:', error);
      toast({
        title: "Failed to add option",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOption = async (optionId: string) => {
    if (room.is_voting_active) {
      toast({
        title: "Cannot remove options",
        description: "Voting is already active",
        variant: "destructive"
      });
      return;
    }

    const option = roomOptions.find(opt => opt.id === optionId);
    if (!option) return;

    // Only allow removing own options or if user is creator
    if (option.submitted_by !== user.id && !isCreator) {
      toast({
        title: "Cannot remove option",
        description: "You can only remove your own options",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedOptions = roomOptions.filter(opt => opt.id !== optionId);
      
      const { error } = await supabase
        .from('rooms')
        .update({ 
          room_options: updatedOptions,
          options: updatedOptions.map(opt => opt.text) // Keep backward compatibility
        })
        .eq('id', room.id);

      if (error) {
        toast({
          title: "Failed to remove option",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Option removed",
        description: "Successfully removed option",
      });
    } catch (error) {
      console.error('Error removing option:', error);
    }
  };

  const handleEditOption = (optionId: string) => {
    if (room.is_voting_active) {
      toast({
        title: "Cannot edit options",
        description: "Voting is already active",
        variant: "destructive"
      });
      return;
    }

    const option = roomOptions.find(opt => opt.id === optionId);
    if (!option) return;

    // Only allow editing own options or if user is creator
    if (option.submitted_by !== user.id && !isCreator) {
      toast({
        title: "Cannot edit option",
        description: "You can only edit your own options",
        variant: "destructive"
      });
      return;
    }

    setEditingOptionId(optionId);
    setEditValue(option.text);
  };

  const handleSaveEdit = async () => {
    if (!editValue.trim() || editingOptionId === null) return;
    
    if (room.is_voting_active) {
      toast({
        title: "Cannot edit options",
        description: "Voting is already active",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedOptions = roomOptions.map(option => 
        option.id === editingOptionId ? { ...option, text: editValue.trim() } : option
      );
      
      const { error } = await supabase
        .from('rooms')
        .update({ 
          room_options: updatedOptions,
          options: updatedOptions.map(opt => opt.text) // Keep backward compatibility
        })
        .eq('id', room.id);

      if (error) {
        toast({
          title: "Failed to update option",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setEditingOptionId(null);
      setEditValue("");
      toast({
        title: "Option updated",
        description: "Successfully updated option",
      });
    } catch (error) {
      console.error('Error updating option:', error);
    }
  };

  const handleStartVoting = async () => {
    if (roomOptions.length < 2) {
      toast({
        title: "Need more options! 🤔",
        description: "Add at least 2 options to start voting",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ is_voting_active: true })
        .eq('id', room.id);

      if (error) {
        toast({
          title: "Failed to start voting",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Voting started! 🗳️",
        description: "All participants can now vote",
      });
      
      onNavigate("voting");
    } catch (error) {
      console.error('Error starting voting:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({
      title: "Copied! 📋",
      description: "Room code copied to clipboard",
    });
  };

  const getSubmitterName = (submittedBy: string) => {
    const participant = room.participants?.find(p => p.user_id === submittedBy);
    return participant?.display_name || 'Unknown';
  };

  const canEditOption = (option: any) => {
    return !room.is_voting_active && (option.submitted_by === user.id || isCreator);
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Room Header */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 mb-6">
          <CardHeader className="text-center">
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
                <Copy className="w-4 h-4 mr-1" />
                {room.code}
              </Badge>
              <Button size="sm" variant="outline" onClick={handleCopyCode}>
                Share Code
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Participants */}
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

        {/* Decision Options */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Decision Options</CardTitle>
            <CardDescription>
              Add the choices you want to vote on
              {room.is_voting_active && " (Voting is active - no more edits allowed)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Option */}
            {!room.is_voting_active && (
              <div className="flex space-x-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add a new option..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                  disabled={isSubmitting}
                />
                <Button 
                  onClick={handleAddOption} 
                  disabled={!newOption.trim() || isSubmitting}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Options List */}
            <AnimatePresence>
              <div className="space-y-2">
                {roomOptions.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                  >
                    {editingOptionId === option.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit();
                            if (e.key === "Escape") setEditingOptionId(null);
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveEdit}>
                          ✓
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingOptionId(null)}>
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-medium text-purple-600 mr-2">
                          {index + 1}.
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-800 font-medium">
                            {option.text}
                          </div>
                          <div className="text-xs text-gray-500">
                            Submitted by {getSubmitterName(option.submitted_by)}
                            {option.submitted_by === user.id && " (you)"}
                          </div>
                        </div>
                        {canEditOption(option) && (
                          <div className="flex space-x-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditOption(option.id)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleRemoveOption(option.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {roomOptions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🤷‍♀️</div>
                <p>No options yet. Add some choices to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start Voting Button (Creator Only) */}
        {isCreator && !room.is_voting_active && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <Button
              onClick={handleStartVoting}
              disabled={roomOptions.length < 2}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold text-xl px-8 py-4 rounded-full"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Voting! 🗳️
            </Button>
          </motion.div>
        )}

        {/* Voting Active State */}
        {room.is_voting_active && (
          <div className="text-center">
            <Card className="bg-gradient-to-br from-green-100 to-blue-100 border-2 border-green-400 shadow-xl">
              <CardContent className="py-6">
                <div className="text-4xl mb-2">🗳️</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Voting is Active!</h3>
                <p className="text-lg text-gray-600 mb-4">
                  {isCreator ? "Participants are voting now..." : "Go to voting screen to cast your vote!"}
                </p>
                {!isCreator && (
                  <Button
                    onClick={() => onNavigate("voting")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-6 py-3 rounded-full"
                  >
                    Vote Now! 🗳️
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!isCreator && !room.is_voting_active && (
          <div className="text-center">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="py-6">
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-lg text-gray-600">
                  Waiting for the room creator to start voting...
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RoomLobby;
