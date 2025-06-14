
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ToneSelectorProps {
  selectedTone: string;
  onToneSelect: (tone: string) => void;
}

const ToneSelector = ({ selectedTone, onToneSelect }: ToneSelectorProps) => {
  const tones = [
    { id: "friendly", label: "Friendly", icon: "😊", description: "Warm & approachable" },
    { id: "formal", label: "Formal", icon: "👔", description: "Professional" },
    { id: "witty", label: "Witty", icon: "🎭", description: "Clever & engaging" }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Choose Your Tone</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {tones.map((tone) => (
            <Button
              key={tone.id}
              variant={selectedTone === tone.id ? "default" : "outline"}
              className={`p-3 h-auto flex items-center justify-start space-x-3 text-left ${
                selectedTone === tone.id 
                  ? "bg-violet-600 hover:bg-violet-700 text-white" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              onClick={() => onToneSelect(tone.id)}
            >
              <span className="text-lg">{tone.icon}</span>
              <div>
                <div className="font-medium text-sm">{tone.label}</div>
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
