
import { motion } from "framer-motion";

interface TiebreakerAnimationProps {
  method: "dice" | "spinner" | "coin";
}

const TiebreakerAnimation = ({ method }: TiebreakerAnimationProps) => {
  const getEmoji = () => {
    switch (method) {
      case "dice": return "🎲";
      case "spinner": return "🎡";
      case "coin": return "🪙";
    }
  };

  const getAnimation = () => {
    switch (method) {
      case "dice":
        return {
          rotate: [0, 180, 360, 540, 720],
          scale: [1, 1.2, 1, 1.2, 1]
        };
      case "spinner":
        return {
          rotate: [0, 360, 720, 1080, 1440],
          scale: [1, 1.1, 1]
        };
      case "coin":
        return {
          rotateY: [0, 180, 360, 540, 720],
          scale: [1, 1.2, 1, 1.2, 1]
        };
    }
  };

  return (
    <motion.div
      className="text-8xl"
      animate={getAnimation()}
      transition={{ duration: 3, ease: "easeOut" }}
    >
      {getEmoji()}
    </motion.div>
  );
};

export default TiebreakerAnimation;
