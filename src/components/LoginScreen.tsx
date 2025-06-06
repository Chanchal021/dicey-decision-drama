
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Screen } from "@/pages/Index";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface LoginScreenProps {
  onNavigate: (screen: Screen) => void;
}

const LoginScreen = ({ onNavigate }: LoginScreenProps) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, user } = useAuth();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      onNavigate("dashboard");
    }
  }, [user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignup) {
        const { error } = await signUp(email, password, name || email.split('@')[0]);
        if (!error) {
          // User will be redirected after email confirmation
        }
      } else {
        const { error } = await signIn(email, password);
        if (!error) {
          onNavigate("dashboard");
        }
      }
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg h-12 rounded-full"
              >
                {isLoading ? "Loading..." : (isSignup ? "Sign Up & Start Playing! 🚀" : "Login & Let's Decide! ✨")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignup(!isSignup)}
                className="text-purple-600 hover:text-purple-700"
                disabled={isLoading}
              >
                {isSignup ? "Already have an account? Login" : "New here? Create account"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate("landing")}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                ← Back to Home
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
