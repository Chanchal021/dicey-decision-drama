
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-black/60 backdrop-blur-sm border-t border-purple-500/30 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              🎲 DiceyDecisions
            </h3>
            <p className="text-gray-400 text-lg">
              Making group decisions epic since 2025.
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
          <p className="text-lg">&copy; 2025 DiceyDecisions. All rights reserved. Made with 💜 for better decisions.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
