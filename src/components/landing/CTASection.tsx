
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User as UserType, Screen } from "@/types";

interface CTASectionProps {
  user: UserType | null;
  onNavigate: (screen: Screen) => void;
}

const CTASection = ({ user, onNavigate }: CTASectionProps) => {
  return (
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
            onClick={() => user ? onNavigate("dashboard") : onNavigate("login")}
            className="group relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-black text-2xl px-16 py-8 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              {user ? "Go to Dashboard! 🎉" : "Let's Go! 🎉"}
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
  );
};

export default CTASection;
