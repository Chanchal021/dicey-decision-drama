
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import TiebreakerAnimation from "./TiebreakerAnimation";

interface TiebreakerAnimationScreenProps {
  method: "dice" | "spinner" | "coin";
}

const TiebreakerAnimationScreen = ({ method }: TiebreakerAnimationScreenProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="py-16">
            <h2 className="text-4xl font-bold text-purple-600 mb-8">
              🎭 Tiebreaker Time! 🎭
            </h2>
            <TiebreakerAnimation method={method} />
            <p className="text-xl text-gray-600 mt-8">
              Let fate decide...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TiebreakerAnimationScreen;
