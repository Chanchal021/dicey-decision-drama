
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const FeaturesSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: "🎭",
      title: "Anonymous Voting Magic",
      description: "Cast your vote in complete secrecy - no bias, no pressure, just pure democracy at work.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "⚡",
      title: "Lightning-Fast Results",
      description: "Watch decisions unfold in real-time with stunning visual feedback and instant updates.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🎲",
      title: "Epic Tiebreaker Shows",
      description: "Transform deadlocks into thrilling moments with our spectacular dice, wheels, and coin flips.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: "🎨",
      title: "Gorgeous Animations",
      description: "Every interaction is a visual delight with smooth transitions and delightful micro-interactions.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: "📈",
      title: "Smart Analytics",
      description: "Track your group's decision patterns and see which tiebreakers save the day most often.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: "🌍",
      title: "Global Accessibility",
      description: "Perfect on any device, anywhere in the world - your decisions travel with you.",
      gradient: "from-pink-500 to-rose-500"
    }
  ];

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
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-5xl md:text-6xl font-black text-center mb-20 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Why You'll Be Obsessed
        </motion.h2>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
              }}
              className="group cursor-pointer"
            >
              <Card className={`h-full bg-gradient-to-br ${feature.gradient} p-1 shadow-2xl transition-all duration-300 ${
                hoveredFeature === index ? 'shadow-purple-500/50' : ''
              }`}>
                <CardContent className="bg-black/80 backdrop-blur-sm rounded-lg p-8 h-full flex flex-col">
                  <div className="text-6xl mb-6 group-hover:animate-spin transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-pink-400 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
