
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Screen, User, Room } from "@/pages/Index";
import { ArrowLeft, Trophy, Users, Calendar, Zap } from "lucide-react";

interface PastDecisionsProps {
  user: User | null;
  rooms: Room[];
  onNavigate: (screen: Screen) => void;
}

const PastDecisions = ({ user, rooms, onNavigate }: PastDecisionsProps) => {
  if (!user) return null;

  const userRooms = rooms.filter(room => 
    room.participants.includes(user.name) && room.resolvedAt
  ).sort((a, b) => (b.resolvedAt?.getTime() || 0) - (a.resolvedAt?.getTime() || 0));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getTiebreakerEmoji = (tiebreaker?: string) => {
    switch (tiebreaker) {
      case 'dice': return '🎲';
      case 'coin': return '🪙';
      case 'spinner': return '🎡';
      default: return '';
    }
  };

  const getGroupSizeEmoji = (participantCount: number) => {
    if (participantCount >= 8) return '🎊';
    if (participantCount >= 5) return '🎉';
    if (participantCount >= 3) return '✨';
    return '👥';
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate("dashboard")}
            className="mb-4 text-white hover:text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              Your Decision History 📚
            </h1>
            <p className="text-xl text-white/80">
              All the choices you've helped make!
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-6">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-google-blue">{userRooms.length}</div>
              <div className="text-gray-600">Decisions Made</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-6">
              <div className="text-3xl mb-2">🎭</div>
              <div className="text-2xl font-bold text-google-red">
                {userRooms.filter(room => room.tiebreakerUsed).length}
              </div>
              <div className="text-gray-600">Tiebreakers Used</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-6">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-google-green">
                {Math.round(userRooms.reduce((sum, room) => sum + room.participants.length, 0) / userRooms.length || 0)}
              </div>
              <div className="text-gray-600">Avg Group Size</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Decisions List */}
        <motion.div variants={itemVariants}>
          {userRooms.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-16">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-3xl font-bold text-gray-600 mb-2">No decisions yet!</h2>
                <p className="text-lg text-gray-500 mb-6">
                  Start creating rooms and making group decisions to see your history here.
                </p>
                <Button
                  onClick={() => onNavigate("dashboard")}
                  className="bg-gradient-to-r from-google-blue to-google-red hover:from-google-blue/90 hover:to-google-red/90 text-white font-bold text-lg px-6 py-3 rounded-full"
                >
                  Make Your First Decision! 🚀
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-800 mb-1">
                            {room.title}
                          </CardTitle>
                          {room.description && (
                            <CardDescription className="text-gray-600">
                              {room.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="text-2xl ml-4">
                          {getGroupSizeEmoji(room.participants.length)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Winner */}
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-google-yellow" />
                          <span className="font-semibold text-gray-700">Winner:</span>
                          <span className="font-bold text-google-blue text-lg">
                            {room.finalChoice}
                          </span>
                        </div>

                        {/* Details Row */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{room.resolvedAt?.toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{room.participants.length} participants</span>
                          </div>

                          {room.tiebreakerUsed && (
                            <Badge className="bg-gradient-to-r from-google-blue/10 to-google-red/10 text-google-blue border-google-blue/20">
                              <span className="mr-1">{getTiebreakerEmoji(room.tiebreakerUsed)}</span>
                              Tiebreaker: {room.tiebreakerUsed}
                            </Badge>
                          )}

                          {room.creator === user.id && (
                            <Badge variant="secondary" className="bg-google-yellow/20 text-google-yellow">
                              <span className="mr-1">👑</span>
                              Creator
                            </Badge>
                          )}
                        </div>

                        {/* Participants */}
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Participants:</div>
                          <div className="flex flex-wrap gap-1">
                            {room.participants.map(participant => (
                              <Badge
                                key={participant}
                                variant={participant === user.name ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {participant === user.name ? `${participant} (You)` : participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PastDecisions;
