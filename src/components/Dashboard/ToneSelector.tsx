
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToneSelectorProps {
  selectedTone: string;
  onToneSelect: (tone: string) => void;
}

const ToneSelector = ({ selectedTone, onToneSelect }: ToneSelectorProps) => {
  const tones = [
    { id: "friendly", label: "Friendly", icon: "😊", description: "Warm and approachable" },
    { id: "formal", label: "Formal", icon: "👔", description: "Professional and polished" },
    { id: "witty", label: "Witty", icon: "🎭", description: "Clever and engaging" }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Choose Your Tone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tones.map((tone) => (
            <Button
              key={tone.id}
              variant={selectedTone === tone.id ? "default" : "outline"}
              className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                selectedTone === tone.id 
                  ? "bg-violet-600 hover:bg-violet-700 text-white" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              onClick={() => onToneSelect(tone.id)}
            >
              <span className="text-2xl">{tone.icon}</span>
              <div className="text-center">
                <div className="font-medium">{tone.label}</div>
                <div className="text-xs opacity-70">{tone.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToneSelector;
