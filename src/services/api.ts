import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const uploadFile = async (
  formData: FormData, 
  onUploadProgress?: (progress: number) => void
) => {
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });
  
  return response.data;
};

export const fetchFiles = async () => {
  const response = await axios.get(`${API_URL}/files`);
  return response.data;
};

export const deleteFile = async (fileId: string) => {
  const response = await axios.delete(`${API_URL}/files/${fileId}`);
  return response.data;
};

export const clearAllFiles = async () => {
  const response = await axios.delete(`${API_URL}/files`);
  return response.data;
};

export const startTranscription = async (fileId: string, model?: string, language?: string) => {
  const response = await axios.post(`${API_URL}/transcribe/${fileId}`, {
    model: model || 'base',
    language: language || 'pt-BR'
  });
  return response.data;
};

export const sendTranscriptionEmail = async (data: {
  transcription: string;
  fileName: string;
  aiTool: string;
  auditRules: string;
  destinationEmail: string;
}) => {
  const response = await axios.post(`${API_URL}/send-email`, data);
  return response.data;
};