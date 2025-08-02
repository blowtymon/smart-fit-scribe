import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';
import { LogEntry } from './LogEntry';
import { LogHistory } from './LogHistory';
import { SettingsPanel } from './SettingsPanel';
import { AuthForm } from './auth/AuthForm';
import { ChatManager } from './chat/ChatManager';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Dumbbell, MessageSquare, History, LogOut } from 'lucide-react';
import { memoryService } from '@/services/memory';
import { useAuth } from '@/hooks/useAuth';
import { useChatStorage } from '@/hooks/useChatStorage';

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
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface CoachSettings {
  apiKey: string;
  model: string;
  temperature: number;
  webSearchEnabled: boolean;
}

export const FitnessCoach = () => {
  const { user, loading, signOut, setUser } = useAuth();
  const { 
    chats, 
    currentChatId, 
    setCurrentChatId, 
    createNewChat, 
    updateChat, 
    deleteChat, 
    getCurrentChat,
    addMessageToCurrentChat 
  } = useChatStorage();
  
  const [logs, setLogs] = useState<Log[]>([]);
  const [settings, setSettings] = useState<CoachSettings>({
    apiKey: '',
    model: 'gpt-4.1-2025-04-14',
    temperature: 0.7,
    webSearchEnabled: false
  });

  useEffect(() => {
    memoryService.initialize();
    
    // Create initial chat if none exist
    if (!loading && user && chats.length === 0) {
      createNewChat();
    }
  }, [loading, user, chats.length]);

  const handleSendMessage = (content: string, aiResponse?: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    addMessageToCurrentChat(userMessage);
    
    if (aiResponse) {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      addMessageToCurrentChat(assistantMessage);
    }
  };

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
    const aiResponse = generateLogResponse(newLog);
    if (aiResponse) {
      handleSendMessage(log.content, aiResponse);
    }
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

  // Show auth form if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Dumbbell className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={setUser} />;
  }

  const currentChat = getCurrentChat();
  const chatMessages = currentChat?.messages || [];

  return (
    <div className="min-h-screen bg-background flex">
      <ChatManager
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={createNewChat}
        chats={chats}
        onUpdateChat={updateChat}
        onDeleteChat={deleteChat}
      />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-8 h-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold">AI Fitness Coach</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Export Data
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 container mx-auto px-6 py-6">
          <Tabs defaultValue="chat" className="h-full flex flex-col space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="log" className="flex items-center space-x-2">
                <Dumbbell className="w-4 h-4" />
                <span>Log Entry</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1">
              <ChatInterface 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                logs={logs}
                settings={settings}
              />
            </TabsContent>

            <TabsContent value="log" className="flex-1">
              <LogEntry onSubmit={handleNewLog} />
            </TabsContent>

            <TabsContent value="history" className="flex-1">
              <LogHistory logs={logs} />
            </TabsContent>

            <TabsContent value="settings" className="flex-1">
              <SettingsPanel 
                settings={settings}
                onSettingsChange={setSettings}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};