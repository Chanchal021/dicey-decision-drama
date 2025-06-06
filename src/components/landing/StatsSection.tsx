
import { motion } from "framer-motion";

const StatsSection = () => {
  const stats = [
    { number: "10K+", label: "Decisions Made", icon: "✅" },
    { number: "50+", label: "Countries", icon: "🌎" },
    { number: "99.9%", label: "Fun Guaranteed", icon: "🎉" },
    { number: "0", label: "Arguments Started", icon: "☮️" }
  ];

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

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
      variants={containerVariants}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          className="text-center group cursor-pointer"
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-4xl mb-2 group-hover:animate-bounce">{stat.icon}</div>
          <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat.number}</div>
          <div className="text-gray-400 font-medium">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsSection;
