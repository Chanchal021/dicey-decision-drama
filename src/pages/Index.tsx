
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRooms } from "@/hooks/useRooms";
import { useNavigationHandler } from "@/hooks/useNavigationHandler";
import ScreenRenderer from "@/components/ScreenRenderer";

const Index = () => {
  console.log('Index component mounting...');
  
  const { user, loading: authLoading } = useAuth();
  console.log('Auth state in Index:', { user: user?.id, authLoading });
  
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
    console.log('Showing loading screen - auth loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const handleCreateRoom = async (roomData: any) => {
    console.log('Creating room with data:', roomData);
    const room = await createRoom(roomData);
    if (room) {
      setCurrentRoomId(room.id);
      setCurrentScreen("room-lobby");
    }
  };

  const handleJoinRoom = async (roomCode: string, displayName: string) => {
    console.log('=== INDEX HANDLE JOIN ROOM START ===');
    console.log('Room Code:', roomCode);
    console.log('Display Name:', displayName);
    console.log('User ID:', user?.id);
    
    const room = await joinRoom(roomCode, displayName);
    console.log('Join room result:', room);
    
    if (room) {
      console.log('✅ Successfully joined room, navigating to lobby');
      setCurrentRoomId(room.id);
      handleNavigateToRoom(room.id);
    } else {
      console.log('❌ Failed to join room');
    }
    console.log('=== INDEX HANDLE JOIN ROOM END ===');
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
