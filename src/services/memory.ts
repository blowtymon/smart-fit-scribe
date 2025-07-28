import type { Log } from '@/components/FitnessCoach';

// Simulated vector storage for demo - replace with Pinecone in production
interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    timestamp: string;
    type: string;
    embedding?: number[];
  };
}

export class MemoryService {
  private documents: VectorDocument[] = [];
  private isInitialized = false;

  async initialize(apiKey?: string, environment?: string, indexName?: string) {
    // In production, this would initialize Pinecone
    console.log('Memory service initialized (simulated)');
    this.isInitialized = true;
  }

  async storeLog(log: Log): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Memory service not initialized');
      return;
    }

    // Simulate vector embedding creation
    const embedding = this.generateSimulatedEmbedding(log.content);
    
    const document: VectorDocument = {
      id: log.id,
      content: log.content,
      metadata: {
        timestamp: log.timestamp.toISOString(),
        type: log.type,
        embedding
      }
    };

    this.documents.push(document);
    console.log(`Stored log in vector memory: ${log.id}`);
  }

  async semanticSearch(query: string, limit: number = 5): Promise<Log[]> {
    if (!this.isInitialized) {
      console.warn('Memory service not initialized');
      return [];
    }

    // Simulate semantic search with simple text matching
    const queryEmbedding = this.generateSimulatedEmbedding(query);
    
    const results = this.documents
      .map(doc => ({
        ...doc,
        similarity: this.cosineSimilarity(
          queryEmbedding,
          doc.metadata.embedding || []
        )
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    // Convert back to Log format
    return results.map(result => ({
      id: result.id,
      content: result.content,
      type: result.metadata.type as 'workout' | 'nutrition' | 'recovery' | 'metrics',
      timestamp: new Date(result.metadata.timestamp)
    }));
  }

  async getLogsByDateRange(startDate: Date, endDate: Date): Promise<Log[]> {
    const filtered = this.documents.filter(doc => {
      const docDate = new Date(doc.metadata.timestamp);
      return docDate >= startDate && docDate <= endDate;
    });

    return filtered.map(doc => ({
      id: doc.id,
      content: doc.content,
      type: doc.metadata.type as 'workout' | 'nutrition' | 'recovery' | 'metrics',
      timestamp: new Date(doc.metadata.timestamp)
    }));
  }

  async getLogsByDay(targetDate: Date): Promise<Log[]> {
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    return this.getLogsByDateRange(dayStart, dayEnd);
  }

  async getMetricTrend(metric: 'weight' | 'waist' | 'doms' | 'sleep' | 'bodyFat', days: number = 7): Promise<Array<{date: Date, value: number}>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const logs = await this.getLogsByDateRange(startDate, endDate);
    
    return logs
      .filter(log => log.structured && log.structured[metric] !== undefined)
      .map(log => ({
        date: log.timestamp,
        value: log.structured![metric] as number
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async generateSummary(timeframe: 'week' | 'month'): Promise<string> {
    const now = new Date();
    const daysBack = timeframe === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    const logs = await this.getLogsByDateRange(startDate, now);
    
    if (logs.length === 0) {
      return 'No training data available for this timeframe.';
    }

    // Simple summary generation
    const workoutCount = logs.filter(l => l.type === 'workout').length;
    const avgDOMS = this.calculateAverageDOMS(logs);
    
    return `**${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Summary:**
- Total workouts: \`${workoutCount}\`
- Average DOMS: \`${avgDOMS.toFixed(1)}/10\`
- Total logs: \`${logs.length}\`
- Most frequent log type: \`${this.getMostFrequentType(logs)}\``;
  }

  private generateSimulatedEmbedding(text: string): number[] {
    // Simulate a 100-dimensional embedding
    const embedding: number[] = [];
    for (let i = 0; i < 100; i++) {
      // Use a simple hash of the text to generate consistent embeddings
      const hash = this.hashString(text + i.toString());
      embedding.push((hash % 200 - 100) / 100); // Normalize to -1 to 1
    }
    return embedding;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateAverageDOMS(logs: Log[]): number {
    const domsLogs = logs.filter(log => log.content.toLowerCase().includes('doms'));
    if (domsLogs.length === 0) return 0;
    
    const domsValues = domsLogs.map(log => {
      const match = log.content.match(/doms[:\s]+(\d+)/i);
      return match ? parseInt(match[1]) : 5;
    });
    
    return domsValues.reduce((sum, val) => sum + val, 0) / domsValues.length;
  }

  private getMostFrequentType(logs: Log[]): string {
    const counts = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }
}

export const memoryService = new MemoryService();