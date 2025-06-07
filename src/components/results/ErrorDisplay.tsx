
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Screen } from "@/types";

interface ErrorDisplayProps {
  type: "no-options" | "processing" | "no-results";
  onNavigate: (screen: Screen) => void;
}

const ErrorDisplay = ({ type, onNavigate }: ErrorDisplayProps) => {
  const getContent = () => {
    switch (type) {
      case "no-options":
        return {
          emoji: "⚠️",
          title: "No Options Available",
          description: "This room doesn't have any voting options yet.",
          titleColor: "text-orange-600"
        };
      case "processing":
        return {
          emoji: "📊",
          title: "Processing Results",
          description: "Loading voting results...",
          titleColor: "text-blue-600"
        };
      case "no-results":
        return {
          emoji: "🤔",
          title: "No Results Yet",
          description: "There are no votes to display results for.",
          titleColor: "text-gray-600"
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
        <CardContent className="py-12 text-center">
          <div className="text-4xl mb-4">{content.emoji}</div>
          <h2 className={`text-2xl font-bold ${content.titleColor} mb-2`}>
            {content.title}
          </h2>
          <p className="text-gray-600 mb-4">{content.description}</p>
          <Button
            onClick={() => onNavigate("dashboard")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-full"
          >
            <Home className="w-6 h-6 mr-2" />
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorDisplay;
