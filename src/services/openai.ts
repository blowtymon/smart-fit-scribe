import OpenAI from 'openai';
import type { Log, ChatMessage } from '@/components/FitnessCoach';

interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

  initialize(config: OpenAIConfig) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      dangerouslyAllowBrowser: true // For demo purposes only
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    logs: Log[],
    searchResults?: string
  ): Promise<string> {
    if (!this.client || !this.config) {
      throw new Error('OpenAI service not initialized');
    }

    const systemPrompt = this.buildSystemPrompt(logs, searchResults);
    const conversationMessages = this.formatMessages(messages);

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        temperature: this.config.temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationMessages
        ],
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private buildSystemPrompt(logs: Log[], searchResults?: string): string {
    const recentLogs = logs.slice(0, 10);
    const logsSummary = recentLogs.map(log => 
      `${log.timestamp.toISOString().split('T')[0]}: ${log.content}`
    ).join('\n');

    return `You are an elite AI fitness coach with deep expertise in evidence-based training, nutrition, and recovery. Your persona combines the analytical rigor of a sports scientist with the motivational energy of a world-class trainer.

## Core Principles:
- **Science-First**: Always base recommendations on peer-reviewed research
- **Individual Context**: Consider the user's complete training history and current state
- **Notion-Style Formatting**: Use markdown with code blocks for key metrics, structured data, and actionable items
- **Motivational Tone**: Be direct, encouraging, and goal-oriented
- **Practical Application**: Provide specific, actionable guidance

## Current Training Context:
Recent training logs:
\`\`\`
${logsSummary}
\`\`\`

${searchResults ? `## Latest Research Context:\n${searchResults}\n` : ''}

## Response Format:
- Use **bold** for key concepts and recommendations
- Use \`code blocks\` for specific metrics, rep ranges, percentages
- Use bullet points and numbered lists for clarity
- Include relevant emojis sparingly for visual structure
- Always provide reasoning behind recommendations

## Key Areas of Expertise:
- Progressive overload and periodization
- Recovery optimization (sleep, nutrition, stress)
- Body composition changes during cuts/bulks
- DOMS interpretation and training adjustments
- Exercise selection and form optimization
- Injury prevention and movement quality

Respond as if you're analyzing data in real-time, connecting patterns from their training history to provide personalized, science-backed guidance.`;
  }

  private formatMessages(messages: ChatMessage[]): Array<{role: 'user' | 'assistant', content: string}> {
    return messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));
  }
}

export const openAIService = new OpenAIService();