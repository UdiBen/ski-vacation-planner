import axios from 'axios';
import { ChatResponse, SendMessageRequest } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const chatAPI = {
  sendMessage: async (data: SendMessageRequest): Promise<ChatResponse> => {
    const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat`, data);
    return response.data;
  },

  createConversation: async (): Promise<{ conversationId: string }> => {
    const response = await axios.post(`${API_BASE_URL}/conversations`);
    return response.data;
  },

  getConversation: async (conversationId: string) => {
    const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}`);
    return response.data;
  }
};
