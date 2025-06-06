
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRooms } from "@/hooks/useRooms";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import ScreenRenderer from "@/components/ScreenRenderer";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { rooms, loading: roomsLoading, createRoom, joinRoom } = useRooms(user?.id);
  
  const {
    currentScreen,
    setCurrentScreen,
    currentRoomId,
    setCurrentRoomId,
    initialRoomCode,
    setInitialRoomCode,
    currentRoom,
    handleRoomUpdated,
    handleNavigateToRoom
  } = useNavigationHandler({ user, rooms, authLoading });

  const screenVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const handleCreateRoom = async (roomData: any) => {
    const room = await createRoom(roomData);
    if (room) {
      setCurrentRoomId(room.id);
      setCurrentScreen("room-lobby");
    }
  };

  const handleJoinRoom = async (roomCode: string, displayName: string) => {
    const room = await joinRoom(roomCode, displayName);
    if (room) {
      setCurrentRoomId(room.id);
      handleNavigateToRoom(room.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          <ScreenRenderer
            currentScreen={currentScreen}
            user={user}
            rooms={rooms}
            currentRoom={currentRoom}
            initialRoomCode={initialRoomCode}
            onNavigate={setCurrentScreen}
            onNavigateToRoom={handleNavigateToRoom}
            onRoomUpdated={handleRoomUpdated}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            setInitialRoomCode={setInitialRoomCode}
            setCurrentScreen={setCurrentScreen}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
