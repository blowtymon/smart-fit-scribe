import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { LogEntry } from './LogEntry';
import { LogHistory } from './LogHistory';
import { SettingsPanel } from './SettingsPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Dumbbell, MessageSquare, History } from 'lucide-react';
import { memoryService } from '@/services/memory';

export interface NutritionData {
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
}

export interface BodyMeasurements {
  weight?: number;
  bodyFat?: number;
  waist?: number;
  leftBicep?: number;
  rightBicep?: number;
}

export interface RecoveryData {
  hrv?: number;
  restingHR?: number;
  doms?: number;
}

export interface WorkoutSet {
  reps: number;
  weight: number;
  rir?: number;
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface StrengthTraining {
  title: string;
  date: string;
  exercises: Exercise[];
  workoutNotes?: string;
}

export interface StructuredData {
  nutrition?: NutritionData;
  bodyMeasurements?: BodyMeasurements;
  recovery?: RecoveryData;
  strengthTraining?: StrengthTraining;
  // Legacy fields for backward compatibility
  doms?: number;
  weight?: number;
  waist?: number;
  bodyFat?: number;
  sleep?: number;
}

export interface Log {
  id: string;
  timestamp: Date;
  type: 'workout' | 'nutrition' | 'recovery' | 'metrics' | 'strength';
  content: string;
  structured?: StructuredData;
  attachments?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    content: string; // base64 encoded file content
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CoachSettings {
  temperature: number;
  model: string;
  searchEnabled: boolean;
  memoryDepth: number;
}

export const FitnessCoach = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "🏋️‍♂️ **Welcome to your AI Fitness Coach!**\n\nI'm here to help you achieve your fitness goals with science-backed guidance. I can:\n\n- **Analyze your logs** and track progress\n- **Provide personalized coaching** based on your data\n- **Research latest fitness science** for evidence-based advice\n- **Remember your history** to give context-aware suggestions\n\nLet's start by logging your current status or ask me anything about your training!",
      timestamp: new Date()
    }
  ]);
  const [settings, setSettings] = useState<CoachSettings>({
    temperature: 0.7,
    model: 'gpt-4o',
    searchEnabled: true,
    memoryDepth: 50
  });

  useEffect(() => {
    // Initialize memory service on component mount
    memoryService.initialize();
  }, []);

  const handleNewLog = async (log: Omit<Log, 'id' | 'timestamp'>) => {
    // Parse natural language for structured data if not already structured
    const enhancedLog = log.structured ? log : parseNaturalLanguageLog(log);
    
    const newLog: Log = {
      ...enhancedLog,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    setLogs(prev => [newLog, ...prev]);
    
    // Store in vector memory for semantic search
    try {
      await memoryService.storeLog(newLog);
    } catch (error) {
      console.error('Failed to store log in memory:', error);
    }
    
    // Auto-generate coaching response based on log
    const aiResponse: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: generateLogResponse(newLog),
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, aiResponse]);
  };

  const parseNaturalLanguageLog = (log: Omit<Log, 'id' | 'timestamp'>): Omit<Log, 'id' | 'timestamp'> => {
    const content = log.content.toLowerCase();
    const structured: any = {};

    // Parse DOMS (various formats)
    const domsMatch = content.match(/doms[:\s]*(\d+)/i);
    if (domsMatch) structured.doms = parseInt(domsMatch[1]);

    // Parse weight (kg)
    const weightMatch = content.match(/([\d.]+)\s*kg/i);
    if (weightMatch) structured.weight = parseFloat(weightMatch[1]);

    // Parse waist measurement 
    const waistMatch = content.match(/waist[:\s]*([\d.]+)/i);
    if (waistMatch) structured.waist = parseFloat(waistMatch[1]);

    // Parse sleep
    const sleepMatch = content.match(/([\d.]+)\s*h?\s*sleep|sleep[:\s]*([\d.]+)/i);
    if (sleepMatch) structured.sleep = parseFloat(sleepMatch[1] || sleepMatch[2]);

    // Parse body fat
    const bfMatch = content.match(/([\d.]+)%?\s*(?:body\s*)?fat|bf[:\s]*([\d.]+)/i);
    if (bfMatch) structured.bodyFat = parseFloat(bfMatch[1] || bfMatch[2]);

    return {
      ...log,
      structured: Object.keys(structured).length > 0 ? structured : undefined
    };
  };

  const generateLogResponse = (log: Log): string => {
    if (log.structured) {
      const { doms, weight, waist, sleep, bodyFat } = log.structured;
      let response = "📊 **Log Analysis**\n\n";
      
      if (doms !== undefined) {
        if (doms <= 2) response += "✅ Low DOMS - good recovery, ready for intensity\n";
        else if (doms <= 4) response += "⚠️ Moderate DOMS - consider lighter training\n";
        else response += "🔴 High DOMS - prioritize recovery today\n";
      }
      
      if (weight) response += `⚖️ Weight: \`${weight}kg\` logged\n`;
      if (waist) response += `📏 Waist: \`${waist}cm\` recorded\n`;
      if (bodyFat) response += `📊 Body Fat: \`${bodyFat}%\` tracked\n`;
      if (sleep) response += `😴 Sleep: \`${sleep}h\` - ${sleep >= 7 ? 'Good!' : 'Could be better'}\n`;
      
      response += "\n💡 Keep tracking consistently for better insights!";
      return response;
    }
    
    return "📝 Log recorded! I'll analyze this with your historical data to provide better coaching.";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dumbbell className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Fitness Coach</h1>
                <p className="text-sm text-muted-foreground">Science-backed training guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center space-x-2">
              <Dumbbell className="h-4 w-4" />
              <span>Log Entry</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatInterface 
              messages={chatMessages}
              onSendMessage={(content, aiResponse) => {
                const userMessage: ChatMessage = {
                  id: crypto.randomUUID(),
                  role: 'user',
                  content,
                  timestamp: new Date()
                };
                setChatMessages(prev => [...prev, userMessage]);
                
                if (aiResponse) {
                  const assistantMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: aiResponse,
                    timestamp: new Date()
                  };
                  setChatMessages(prev => [...prev, assistantMessage]);
                }
              }}
              logs={logs}
              settings={settings}
            />
          </TabsContent>

          <TabsContent value="log">
            <LogEntry onSubmit={handleNewLog} />
          </TabsContent>

          <TabsContent value="history">
            <LogHistory logs={logs} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel 
              settings={settings}
              onSettingsChange={setSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};