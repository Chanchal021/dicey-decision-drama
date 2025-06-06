
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User as UserType, Screen } from "@/types";
import StatsSection from "./StatsSection";

interface HeroSectionProps {
  user: UserType | null;
  onNavigate: (screen: Screen) => void;
}

const HeroSection = ({ user, onNavigate }: HeroSectionProps) => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacityRange = useTransform(scrollY, [0, 300], [1, 0.3]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <motion.section 
      className="relative min-h-screen flex items-center justify-center"
      style={{ y: parallaxY, opacity: opacityRange }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/30 to-black/50"></div>
      
      <motion.div 
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-8 leading-tight"
          variants={itemVariants}
        >
          Stop The Drama.<br />
          <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Roll The Dice 🎲
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-2xl md:text-3xl text-gray-200 mb-12 leading-relaxed max-w-4xl mx-auto"
          variants={itemVariants}
        >
          Transform group arguments into epic moments of fun with 
          <span className="text-purple-400 font-bold"> DiceyDecisions</span> - 
          where every choice becomes an adventure.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          variants={itemVariants}
        >
          {user ? (
            <>
              <Button 
                onClick={() => onNavigate("dashboard")}
                className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Go to Dashboard 🚀</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              <Button 
                onClick={() => onNavigate("join-room")}
                variant="outline"
                className="group border-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 bg-transparent backdrop-blur-sm"
              >
                Join Room 🎯
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => onNavigate("login")}
                className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10">Start Rolling 🚀</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              <Button 
                onClick={() => onNavigate("login")}
                variant="outline"
                className="group border-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 bg-transparent backdrop-blur-sm"
              >
                Join The Fun 🎯
              </Button>
            </>
          )}
        </motion.div>

        <StatsSection />
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
