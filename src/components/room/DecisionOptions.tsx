
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Room, User } from "@/types";

interface DecisionOptionsProps {
  room: Room;
  user: User;
}

const DecisionOptions = ({ room, user }: DecisionOptionsProps) => {
  const [newOption, setNewOption] = useState("");
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const roomOptions = room.options || [];

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
      const { error } = await supabase
        .from('options')
        .insert({
          room_id: room.id,
          submitted_by: user.id,
          text: newOption.trim()
        });

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
    if (option.submitted_by !== user.id && room.creator_id !== user.id) {
      toast({
        title: "Cannot remove option",
        description: "You can only remove your own options",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('options')
        .delete()
        .eq('id', optionId);

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
    if (option.submitted_by !== user.id && room.creator_id !== user.id) {
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
      const { error } = await supabase
        .from('options')
        .update({ text: editValue.trim() })
        .eq('id', editingOptionId);

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

  const getSubmitterName = (submittedBy: string) => {
    const participant = room.room_participants?.find(p => p.user_id === submittedBy);
    return participant?.display_name || 'Unknown';
  };

  const canEditOption = (option: any) => {
    return !room.is_voting_active && (option.submitted_by === user.id || room.creator_id === user.id);
  };

  return (
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
  );
};

export default DecisionOptions;
