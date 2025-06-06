
import { motion } from "framer-motion";

const FloatingElements = () => {
  const floatingElements = [
    { emoji: "🎲", delay: 0, duration: 4 },
    { emoji: "🎡", delay: 1, duration: 5 },
    { emoji: "🪙", delay: 2, duration: 3.5 },
    { emoji: "🎯", delay: 0.5, duration: 4.5 },
    { emoji: "⚡", delay: 1.5, duration: 3 },
    { emoji: "🎊", delay: 2.5, duration: 4.2 }
  ];

  return (
    <>
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl opacity-20"
          style={{
            left: `${15 + (index * 15)}%`,
            top: `${20 + (index % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {element.emoji}
        </motion.div>
      ))}
    </>
  );
};

export default FloatingElements;
