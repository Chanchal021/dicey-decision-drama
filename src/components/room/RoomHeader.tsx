
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Room } from "@/types";

interface RoomHeaderProps {
  room: Room;
}

const RoomHeader = ({ room }: RoomHeaderProps) => {
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    toast({
      title: "Copied! 📋",
      description: "Room code copied to clipboard",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
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
    </motion.div>
  );
};

export default RoomHeader;
