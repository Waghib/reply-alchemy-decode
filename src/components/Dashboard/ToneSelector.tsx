
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
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Choose Your Tone</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {tones.map((tone) => (
            <Button
              key={tone.id}
              variant={selectedTone === tone.id ? "default" : "outline"}
              className={`p-2 h-auto flex flex-col items-center justify-center text-center transition-all ${
                selectedTone === tone.id 
                  ? "bg-violet-600 hover:bg-violet-700 text-white" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              onClick={() => onToneSelect(tone.id)}
            >
              <span className="text-lg mb-1">{tone.icon}</span>
              <div className="space-y-0.5">
                <div className="font-medium text-xs">{tone.label}</div>
                <div className="text-[10px] opacity-70 leading-tight">{tone.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ToneSelector;
