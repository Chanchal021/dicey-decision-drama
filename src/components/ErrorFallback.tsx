
import { Card, CardContent } from "@/components/ui/card";
import { Screen } from "@/types";

interface ErrorFallbackProps {
  error: string;
  screen: string;
  onNavigate: (screen: Screen) => void;
}

const ErrorFallback = ({ error, screen, onNavigate }: ErrorFallbackProps) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-400 flex items-center justify-center p-4">
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
      <CardContent className="py-12 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-4">Error on {screen} screen: {error}</p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-2 rounded-full"
        >
          Back to Dashboard
        </button>
      </CardContent>
    </Card>
  </div>
);

export default ErrorFallback;
