import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Search, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { openAIService } from '@/services/openai';
import { searchService } from '@/services/search';
import { memoryService } from '@/services/memory';
import type { ChatMessage, Log, CoachSettings } from './FitnessCoach';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, aiResponse?: string) => void;
  logs: Log[];
  settings: CoachSettings;
}

export const ChatInterface = ({ messages, onSendMessage, logs, settings }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Check if we have OpenAI API key (in a real app, this would be more secure)
      const apiKey = localStorage.getItem('openai_api_key');
      
      if (apiKey) {
        // Initialize OpenAI service
        openAIService.initialize({
          apiKey,
          model: settings.model,
          temperature: settings.temperature
        });

        let searchResults = '';
        
        // Perform web search if enabled and query seems research-related
        if (settings.searchEnabled && isResearchQuery(messageContent)) {
          try {
            const results = await searchService.searchFitnessResearch({
              query: messageContent
            });
            searchResults = await searchService.summarizeResearch(results);
          } catch (error) {
            console.error('Search error:', error);
          }
        }

        // Generate AI response
        const aiResponse = await openAIService.generateResponse(
          messages,
          logs,
          searchResults
        );
        
        onSendMessage(messageContent, aiResponse);
      } else {
        // Fallback response when no API key
        const fallbackResponse = generateFallbackResponse(messageContent, logs);
        onSendMessage(messageContent, fallbackResponse);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = "I apologize, but I encountered an error. Please check your API configuration in settings.";
      onSendMessage(messageContent, errorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const isResearchQuery = (query: string): boolean => {
    const researchKeywords = [
      'research', 'study', 'studies', 'evidence', 'science', 'latest',
      'should i', 'is it better', 'what does research say', 'according to'
    ];
    return researchKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  };

  const generateFallbackResponse = (query: string, logs: Log[]): string => {
    // Simple pattern matching for common queries
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('doms')) {
      const recentDoms = logs
        .filter(log => log.structured?.doms !== undefined)
        .slice(0, 3);
      
      if (recentDoms.length > 0) {
        const avgDoms = recentDoms.reduce((sum, log) => sum + (log.structured?.doms || 0), 0) / recentDoms.length;
        return `📊 **DOMS Analysis**\n\nYour recent DOMS average: \`${avgDoms.toFixed(1)}/10\`\n\n${avgDoms <= 3 ? '✅ Good recovery - ready for intensity' : '⚠️ Consider lighter training or extra recovery'}`;
      }
    }
    
    if (lowerQuery.includes('weight') || lowerQuery.includes('waist')) {
      const recentWeights = logs
        .filter(log => log.structured?.weight !== undefined)
        .slice(0, 3);
      
      if (recentWeights.length > 0) {
        const latestWeight = recentWeights[0].structured?.weight;
        return `⚖️ **Weight Tracking**\n\nLatest weight: \`${latestWeight}kg\`\n\nConfigure your OpenAI API key in settings for detailed analysis and trends.`;
      }
    }
    
    return `🤖 **AI Coach Response**\n\nI see you asked: "${query}"\n\nFor personalized, science-backed coaching with real-time research, please:\n\n1. Add your **OpenAI API key** in Settings\n2. Enable **web search** for latest research\n3. Continue logging your training data\n\nI'll then provide detailed analysis based on your complete training history!`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-gradient-to-br from-card via-card to-card/90 border-border/50">
      {/* Chat Header */}
      <div className="border-b border-border/50 p-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 bg-gradient-to-br from-accent to-accent-glow">
            <AvatarFallback className="bg-transparent text-accent-foreground">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">AI Fitness Coach</h3>
            <p className="text-xs text-muted-foreground">
              Model: {settings.model} • Temperature: {settings.temperature} • {logs.length} logs in memory
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className={`h-8 w-8 ${
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-primary to-primary-glow' 
                  : 'bg-gradient-to-br from-accent to-accent-glow'
              }`}>
                <AvatarFallback className="bg-transparent text-white">
                  {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary-glow text-primary-foreground'
                      : 'bg-muted border border-border/50'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-code:bg-accent/20 prose-code:text-accent prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                      <ReactMarkdown 
                        components={{
                          code: ({ children, ...props }) => (
                            <code 
                              className="bg-accent/20 text-accent px-1 py-0.5 rounded text-sm font-mono" 
                              {...props}
                            >
                              {children}
                            </code>
                          ),
                          p: ({ children, ...props }) => (
                            <p className="mb-2 last:mb-0" {...props}>{children}</p>
                          )
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                <p className={`text-xs text-muted-foreground mt-1 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  {format(message.timestamp, 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8 bg-gradient-to-br from-accent to-accent-glow">
                <AvatarFallback className="bg-transparent text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted border border-border/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyzing with AI...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your training, log something, or get coaching advice..."
            className="min-h-[60px] bg-input border-border/50 focus:ring-accent resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {settings.searchEnabled && "🔍 Web search enabled"} • Press Enter to send, Shift+Enter for new line
            </p>
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-accent to-accent-glow hover:from-accent-glow hover:to-accent"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};