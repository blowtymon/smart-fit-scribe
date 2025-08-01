import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, Bot, User, Loader2, Wifi, WifiOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { openAIService } from '@/services/openai';
import { searchService } from '@/services/search';
import { ChatMessage, Log, CoachSettings } from './FitnessCoach';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, aiResponse?: string) => void;
  logs: Log[];
  settings: CoachSettings;
}

export function ChatInterface({ messages, onSendMessage, logs, settings }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageContent = input.trim();
    setInput('');
    setLoading(true);

    try {
      let aiResponse = '';
      
      if (settings.apiKey) {
        openAIService.initialize({
          apiKey: settings.apiKey,
          model: settings.model,
          temperature: settings.temperature
        });

        if (settings.webSearchEnabled && messageContent.toLowerCase().includes('research')) {
          try {
            const searchResults = await searchService.search(messageContent);
            aiResponse = await openAIService.generateResponse(messages, logs, searchResults);
          } catch {
            aiResponse = await openAIService.generateResponse(messages, logs);
          }
        } else {
          aiResponse = await openAIService.generateResponse(messages, logs);
        }
      } else {
        aiResponse = "I'd love to give you personalized advice! To unlock my full potential, please add your OpenAI API key in the Settings tab.";
      }

      onSendMessage(messageContent, aiResponse);
    } catch (error) {
      console.error('Error generating response:', error);
      onSendMessage(messageContent, "Sorry, I encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Fitness Coach</CardTitle>
          <div className="flex items-center space-x-2">
            {settings.apiKey ? (
              <Badge variant="secondary" className="text-xs">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline Mode
              </Badge>
            )}
          </div>
        </div>
        <Separator />
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Your AI Fitness Coach!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  I'm here to help you achieve your fitness goals. Ask me about your workouts, nutrition, 
                  recovery, or any fitness-related questions.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar className={`h-8 w-8 ${
                    message.isUser 
                      ? 'bg-gradient-to-br from-primary to-primary-glow' 
                      : 'bg-gradient-to-br from-accent to-accent-glow'
                  }`}>
                    <AvatarFallback className="bg-transparent text-white">
                      {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex-1 max-w-[80%] ${message.isUser ? 'text-right' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-gradient-to-br from-primary to-primary-glow text-primary-foreground'
                          : 'bg-accent/20 text-accent-foreground'
                      }`}
                    >
                      {!message.isUser ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${
                      message.isUser ? 'text-right' : ''
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 bg-gradient-to-br from-accent to-accent-glow">
                  <AvatarFallback className="bg-transparent text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-accent/20 text-accent-foreground rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-6 pt-4 border-t">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about your fitness journey..."
                className="resize-none"
                rows={2}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="px-3"
                disabled={loading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}