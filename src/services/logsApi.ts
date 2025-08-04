import { apiService } from './api';

export interface Log {
  id?: string;
  timestamp: Date;
  content: string;
  type: string;
  source: string;
  data?: any;
}

export interface SaveLogRequest {
  content: string;
  type: string;
  source: string;
  data?: any;
}

export interface FilterLogsRequest {
  source?: string;
  start?: string;
  end?: string;
}

export interface UpdateLogRequest {
  content?: string;
  type?: string;
  data?: any;
}

class LogsApiService {
  async saveLog(data: SaveLogRequest) {
    const response = await apiService.post<Log>('/logs/save', data);
    
    if (response.success && response.data) {
      response.data.timestamp = new Date(response.data.timestamp);
    }
    
    return response;
  }

  async getLogs(limit?: number) {
    const endpoint = limit ? `/logs/?limit=${limit}` : '/logs/';
    const response = await apiService.get<Log[]>(endpoint);
    
    if (response.success && response.data) {
      response.data = response.data.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
    
    return response;
  }

  async filterLogs(filters: FilterLogsRequest) {
    const params = new URLSearchParams();
    
    if (filters.source) params.append('source', filters.source);
    if (filters.start) params.append('start', filters.start);
    if (filters.end) params.append('end', filters.end);
    
    const endpoint = `/logs/filter?${params.toString()}`;
    const response = await apiService.get<Log[]>(endpoint);
    
    if (response.success && response.data) {
      response.data = response.data.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
    
    return response;
  }

  async searchLogs(query: string) {
    const response = await apiService.get<Log[]>(`/logs/search?q=${encodeURIComponent(query)}`);
    
    if (response.success && response.data) {
      response.data = response.data.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
    
    return response;
  }

  async updateLog(logId: string, data: UpdateLogRequest) {
    const response = await apiService.put<Log>(`/logs/update/${logId}`, data);
    
    if (response.success && response.data) {
      response.data.timestamp = new Date(response.data.timestamp);
    }
    
    return response;
  }

  async deleteLog(logId: string) {
    return apiService.delete(`/logs/delete/${logId}`);
  }
}

export const logsApi = new LogsApiService();