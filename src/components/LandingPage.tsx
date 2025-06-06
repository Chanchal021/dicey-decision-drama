
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/pages/Index";

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: "🤫",
      title: "Anonymous Voting",
      description: "Vote without bias - no one knows who chose what until results are revealed!"
    },
    {
      icon: "⚡",
      title: "Real-Time Results",
      description: "Watch votes come in live and see the excitement build as decisions unfold."
    },
    {
      icon: "🎲",
      title: "Epic Tiebreakers",
      description: "When votes are tied, let the dice, spinner, or coin flip decide your fate!"
    },
    {
      icon: "🎬",
      title: "Fun Animations",
      description: "Every reveal is a mini celebration with delightful animations and surprises."
    },
    {
      icon: "📊",
      title: "Decision History",
      description: "Track all your past group decisions and see what tiebreakers saved the day."
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Make decisions on the go - works perfectly on any device, anywhere."
    }
  ];

  const testimonials = [
    {
      text: "Deciding dinner has never been this fun! 🍕",
      author: "Sarah, 24",
      avatar: "👩‍🦱"
    },
    {
      text: "Finally solved our movie night debates 🎬",
      author: "Jake, 28", 
      avatar: "👨‍💼"
    },
    {
      text: "The dice roll for vacation destination was EPIC! ✈️",
      author: "Maya, 22",
      avatar: "👩‍🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 text-6xl"
          animate={floatingAnimation}
          style={{ animationDelay: "0s" }}
        >
          🎲
        </motion.div>
        <motion.div 
          className="absolute top-40 right-20 text-5xl"
          animate={floatingAnimation}
          style={{ animationDelay: "1s" }}
        >
          🎡
        </motion.div>
        <motion.div 
          className="absolute bottom-32 left-20 text-5xl"
          animate={floatingAnimation}
          style={{ animationDelay: "2s" }}
        >
          🪙
        </motion.div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Stop Arguing.<br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Start Rolling 🎲
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            DiceyDecisions makes group choices fun, fair, and fast.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              onClick={() => onNavigate("login")}
              className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Get Started 🚀
            </Button>
            <Button 
              onClick={() => onNavigate("join-room")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold text-lg px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Join Room 🎯
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            {...fadeInUp}
          >
            How It Works
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Create a Room</h3>
              <p className="text-gray-600 text-lg">Set up your decision room and invite your friends with a simple code.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <div className="text-6xl mb-4">🤫</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Submit & Vote</h3>
              <p className="text-gray-600 text-lg">Everyone adds options and votes anonymously for maximum fairness.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={fadeInUp}
            >
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Let Fate Decide</h3>
              <p className="text-gray-600 text-lg">If there's a tie, our fun tiebreakers will settle it once and for all!</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            {...fadeInUp}
          >
            Why You'll Love It
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card className={`h-full cursor-pointer transition-all duration-300 ${
                  hoveredFeature === index ? 'shadow-xl bg-gradient-to-br from-white to-blue-50' : 'shadow-lg hover:shadow-xl'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            {...fadeInUp}
          >
            What People Say
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:border-yellow-300 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-2xl mb-4">{testimonial.avatar}</div>
                    <p className="text-lg mb-4 text-gray-700 italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-gray-800">- {testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 relative overflow-hidden">
        <motion.div 
          className="absolute top-10 left-10 text-4xl opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          🎲
        </motion.div>
        <motion.div 
          className="absolute bottom-10 right-10 text-4xl opacity-20"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          🎡
        </motion.div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Ready to Roll? 🎲
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands making decisions the fun way!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              onClick={() => onNavigate("login")}
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-xl px-12 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Sign Up Free 🎉
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                🎲 DiceyDecisions
              </h3>
              <p className="text-gray-400">
                Making group decisions fun, fair, and fast since 2024.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4 text-2xl">
                <span className="cursor-pointer hover:scale-110 transition-transform">📱</span>
                <span className="cursor-pointer hover:scale-110 transition-transform">🐦</span>
                <span className="cursor-pointer hover:scale-110 transition-transform">📘</span>
                <span className="cursor-pointer hover:scale-110 transition-transform">📸</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DiceyDecisions. All rights reserved. Made with 💜 for better decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
