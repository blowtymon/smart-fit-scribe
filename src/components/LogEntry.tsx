import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Zap } from 'lucide-react';
import type { Log } from './FitnessCoach';

interface LogEntryProps {
  onSubmit: (log: Omit<Log, 'id' | 'timestamp'>) => void;
}

export const LogEntry = ({ onSubmit }: LogEntryProps) => {
  const { toast } = useToast();
  const [logType, setLogType] = useState<'workout' | 'nutrition' | 'recovery' | 'metrics'>('recovery');
  
  // Structured form state
  const [doms, setDoms] = useState([3]);
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [sleep, setSleep] = useState('');
  const [notes, setNotes] = useState('');
  
  // Quick log state
  const [quickLog, setQuickLog] = useState('');

  const handleQuickLog = () => {
    if (!quickLog.trim()) return;
    
    onSubmit({
      type: 'recovery',
      content: quickLog,
    });
    
    setQuickLog('');
    toast({
      title: "Log saved!",
      description: "Your quick log has been recorded and sent to the AI coach.",
    });
  };

  const handleStructuredSubmit = () => {
    const structured = {
      doms: doms[0],
      weight: weight ? parseFloat(weight) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      sleep: sleep ? parseFloat(sleep) : undefined,
      notes: notes || undefined,
    };

    let content = `DOMS: ${doms[0]}/10`;
    if (weight) content += `, Weight: ${weight}kg`;
    if (waist) content += `, Waist: ${waist}cm`;
    if (bodyFat) content += `, Body Fat: ${bodyFat}%`;
    if (sleep) content += `, Sleep: ${sleep}h`;
    if (notes) content += `, Notes: ${notes}`;

    onSubmit({
      type: logType,
      content,
      structured,
    });

    // Reset form
    setDoms([3]);
    setWeight('');
    setWaist('');
    setBodyFat('');
    setSleep('');
    setNotes('');
    
    toast({
      title: "Structured log saved!",
      description: "Your detailed metrics have been recorded.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card">
          <TabsTrigger value="quick">Quick Log</TabsTrigger>
          <TabsTrigger value="structured">Structured Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card className="bg-gradient-to-br from-card via-card to-card/90">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">Quick Log</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Natural language entry - just type what you want to log
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quick-log">Log Entry</Label>
                <Textarea
                  id="quick-log"
                  value={quickLog}
                  onChange={(e) => setQuickLog(e.target.value)}
                  placeholder="e.g., DOMS 3, 71.4kg, 6.5h sleep, sore triceps"
                  className="min-h-[100px] bg-input border-border/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Example formats:</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">DOMS 3, 71.4kg, 6.5h sleep</Badge>
                  <Badge variant="outline" className="text-xs">Waist 85cm, feeling lean</Badge>
                  <Badge variant="outline" className="text-xs">Body fat 12%, great progress</Badge>
                  <Badge variant="outline" className="text-xs">Chest day, 5x5 bench</Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleQuickLog}
                disabled={!quickLog.trim()}
                className="w-full bg-gradient-to-r from-accent to-accent-glow hover:from-accent-glow hover:to-accent"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Quick Log
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structured" className="space-y-4">
          <Card className="bg-gradient-to-br from-card via-card to-card/90">
            <CardHeader>
              <CardTitle className="text-lg">Structured Entry</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed metrics for precise tracking and analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="log-type">Log Type</Label>
                <Select value={logType} onValueChange={(value: any) => setLogType(value)}>
                  <SelectTrigger className="bg-input border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recovery">Recovery & Metrics</SelectItem>
                    <SelectItem value="workout">Workout</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="metrics">Body Metrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>DOMS Level: {doms[0]}/10</Label>
                  <div className="px-2">
                    <Slider
                      value={doms}
                      onValueChange={setDoms}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>No soreness</span>
                    <span>Extreme soreness</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="71.4"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist (cm)</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="85.0"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyFat">Body Fat (%)</Label>
                    <Input
                      id="bodyFat"
                      type="number"
                      step="0.1"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="12.5"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sleep">Sleep (hours)</Label>
                    <Input
                      id="sleep"
                      type="number"
                      step="0.5"
                      value={sleep}
                      onChange={(e) => setSleep(e.target.value)}
                      placeholder="7.5"
                      className="bg-input border-border/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Feeling strong today, triceps still sore from Monday..."
                  className="bg-input border-border/50"
                />
              </div>

              <Button 
                onClick={handleStructuredSubmit}
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Structured Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};