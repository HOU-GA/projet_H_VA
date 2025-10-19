

// services/chatService.js - CORRECTION DES NOTIFICATIONS
import axios from 'axios';

const API_URL = 'http://localhost:9843/api/chat';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const chatService = {
  // Conversations
  getConversations: () => api.get('/conversations'),
  createConversation: (data) => api.post('/conversations', data),
  getConversationMessages: (conversationId, page = 1, limit = 50) => 
    api.get(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`),
  
  // Messages
  sendMessage: (data) => api.post('/messages', data),
  markMessagesAsRead: (conversationId) => api.put('/messages/mark-read', { conversation_id: conversationId }),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // ✅ CORRECTION: Notifications avec gestion d'erreur
  getNotifications: (page = 1, limit = 50) => {
    console.log('📡 chatService - getNotifications appelé');
    return api.get(`/notifications?page=${page}&limit=${limit}`)
      .then(response => {
        console.log('✅ chatService - getNotifications réussite:', response.data);
        return response;
      })
      .catch(error => {
        console.error('❌ chatService - getNotifications erreur:', error);
        // Retourner une structure cohérente même en cas d'erreur
        return {
          data: {
            success: false,
            notifications: [],
            unreadCount: 0,
            error: error.message
          }
        };
      });
  },
  
  markNotificationsAsRead: (notificationIds) => {
    console.log('📡 chatService - markNotificationsAsRead:', notificationIds);
    return api.patch('/notifications/mark-read', { notificationIds })
      .catch(error => {
        console.error('❌ chatService - markNotificationsAsRead erreur:', error);
        throw error;
      });
  },
  
  // ✅ NOUVELLE FONCTION: Marquer les notifications d'une conversation comme lues
  markConversationNotificationsAsRead: (conversationId) => {
    console.log('📡 chatService - markConversationNotificationsAsRead:', conversationId);
    return api.patch('/notifications/mark-conversation-read', { conversationId })
      .catch(error => {
        console.error('❌ chatService - markConversationNotificationsAsRead erreur:', error);
        throw error;
      });
  },
  
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  
  // Appels
  startCall: (data) => api.post('/calls', data),
  updateCall: (callId, data) => api.put(`/calls/${callId}`, data),
  getCallHistory: (page = 1, limit = 20) => api.get(`/calls/history?page=${page}&limit=${limit}`),
};

export default chatService; 
