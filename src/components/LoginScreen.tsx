
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen, User } from "@/pages/Index";

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onNavigate: (screen: Screen) => void;
}

const LoginScreen = ({ onLogin, onNavigate }: LoginScreenProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && (name || !isSignup)) {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: name || email.split('@')[0]
      };
      onLogin(user);
      onNavigate("dashboard");
    }
  };

  const emojiVariants = {
    animate: {
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              <motion.span variants={emojiVariants} animate="animate" className="text-4xl">🎲</motion.span>
              <motion.span variants={emojiVariants} animate="animate" style={{ animationDelay: "0.3s" }} className="text-4xl">🪙</motion.span>
              <motion.span variants={emojiVariants} animate="animate" style={{ animationDelay: "0.6s" }} className="text-4xl">🎡</motion.span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-google-blue to-google-red bg-clip-text text-transparent">
              DiceyDecisions
            </CardTitle>
            <CardDescription className="text-lg">
              Make group decisions fun and easy! 🎉
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSignup && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg h-12"
                    required={isSignup}
                  />
                </motion.div>
              )}
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-lg h-12"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg h-12"
                required
              />
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-google-blue to-google-green hover:from-google-blue/90 hover:to-google-green/90 text-white font-bold text-lg h-12 rounded-full"
              >
                {isSignup ? "Sign Up & Start Playing! 🚀" : "Login & Let's Decide! ✨"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignup(!isSignup)}
                className="text-google-blue hover:text-google-blue/80"
              >
                {isSignup ? "Already have an account? Login" : "New here? Create account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
