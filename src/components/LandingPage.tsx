
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/types";

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacityRange = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const floatingElements = [
    { emoji: "🎲", delay: 0, duration: 4 },
    { emoji: "🎡", delay: 1, duration: 5 },
    { emoji: "🪙", delay: 2, duration: 3.5 },
    { emoji: "🎯", delay: 0.5, duration: 4.5 },
    { emoji: "⚡", delay: 1.5, duration: 3 },
    { emoji: "🎊", delay: 2.5, duration: 4.2 }
  ];

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

  const stats = [
    { number: "10K+", label: "Decisions Made", icon: "✅" },
    { number: "50+", label: "Countries", icon: "🌎" },
    { number: "99.9%", label: "Fun Guaranteed", icon: "🎉" },
    { number: "0", label: "Arguments Started", icon: "☮️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%,transparent_100%)] bg-[length:60px_60px] animate-pulse"></div>
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
      </div>

      {/* Mouse Follower */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full pointer-events-none z-50 mix-blend-screen"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut"
        }}
      />

      {/* Hero Section */}
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
            <Button 
              onClick={() => onNavigate("login")}
              className="group relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Start Rolling 🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
            <Button 
              onClick={() => onNavigate("join-room")}
              variant="outline"
              className="group border-4 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 bg-transparent backdrop-blur-sm"
            >
              Join The Fun 🎯
            </Button>
          </motion.div>

          {/* Stats */}
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
        </motion.div>
      </motion.section>

      {/* Features Section */}
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

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-500/20"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(219, 39, 119, 0.2), rgba(239, 68, 68, 0.2))",
              "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2), rgba(219, 39, 119, 0.2))",
              "linear-gradient(225deg, rgba(219, 39, 119, 0.2), rgba(239, 68, 68, 0.2), rgba(147, 51, 234, 0.2))",
              "linear-gradient(315deg, rgba(147, 51, 234, 0.2), rgba(219, 39, 119, 0.2), rgba(239, 68, 68, 0.2))"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
          <motion.h2 
            className="text-5xl md:text-7xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Roll? 🎲
          </motion.h2>
          <motion.p 
            className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join thousands of groups who've discovered the secret to stress-free decision making!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", damping: 20 }}
          >
            <Button 
              onClick={() => onNavigate("login")}
              className="group relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-black text-2xl px-16 py-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Let's Go! 🎉
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  🎲
                </motion.span>
              </span>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/60 backdrop-blur-sm border-t border-purple-500/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
            <div>
              <h3 className="text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                🎲 DiceyDecisions
              </h3>
              <p className="text-gray-400 text-lg">
                Making group decisions epic since 2024.
              </p>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">Contact</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors text-lg">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-4 text-white">Connect</h4>
              <div className="flex justify-center md:justify-start space-x-6 text-3xl">
                {["📱", "🐦", "📘", "📸"].map((emoji, index) => (
                  <motion.span 
                    key={index}
                    className="cursor-pointer hover:scale-125 transition-transform duration-200"
                    whileHover={{ rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p className="text-lg">&copy; 2024 DiceyDecisions. All rights reserved. Made with 💜 for better decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
