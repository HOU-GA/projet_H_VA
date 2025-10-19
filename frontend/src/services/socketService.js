
// services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.isConnected) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for Socket.IO connection');
      return;
    }

    this.socket = io('http://localhost:9843', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // ✅ NOUVEAU: Événement pour confirmation d'envoi de message
  onMessageSent(callback) {
    this.socket?.on('message_sent', callback);
  }

  // Événements de message
  onNewMessage(callback) {
    this.socket?.on('new_message', callback);
  }

  onMessageRead(callback) {
    this.socket?.on('messages_read', callback);
  }

  // Événements d'appel
  onIncomingCall(callback) {
    this.socket?.on('incoming_call', callback);
  }

  onCallAccepted(callback) {
    this.socket?.on('call_accepted', callback);
  }

  onCallEnded(callback) {
    this.socket?.on('call_ended', callback);
  }

  onIceCandidate(callback) {
    this.socket?.on('ice_candidate', callback);
  }

  // Événements de notification
  onNewNotification(callback) {
    this.socket?.on('new_notification', callback);
  }

  // Émettre des événements
  joinConversation(conversationId) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(data) {
    this.socket?.emit('send_message', data);
  }

  markAsRead(conversationId) {
    this.socket?.emit('mark_as_read', conversationId);
  }

  initiateCall(data) {
    this.socket?.emit('initiate_call', data);
  }

  acceptCall(data) {
    this.socket?.emit('accept_call', data);
  }

  endCall(callId) {
    this.socket?.emit('end_call', callId);
  }

  sendIceCandidate(data) {
    this.socket?.emit('ice_candidate', data);
  }

  // Méthode utilitaire
  getConnectionStatus() {
    return this.isConnected && this.socket?.connected;
  }
}

const socketService = new SocketService();
export default socketService; 