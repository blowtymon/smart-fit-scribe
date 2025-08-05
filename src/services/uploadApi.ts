import { apiService } from './api';

export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  logId?: string;
  error?: string;
}

export const uploadApi = {
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/upload/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fitness_token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        fileUrl: data.fileUrl,
        logId: data.logId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  },
};