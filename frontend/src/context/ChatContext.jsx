

// context/ChatContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';
import chatService from '../services/chatService';
import chatReducer, { initialState } from '../JS/reduces/ChatReducer';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const isAuth = useSelector(state => state.authReducer.isAuth);
  const currentUser = useSelector(state => state.authReducer.user);
  
  const stateRef = useRef(state);
  stateRef.current = state;

  // ✅ LOGS POUR DEBUG
  useEffect(() => {
    console.log('🔍 ChatContext State Update:', {
      selectedConversation: state.selectedConversation?._id,
      conversationsCount: state.conversations.length,
      messagesCount: state.messages.length,
      notificationsCount: state.notifications.length,
      unreadNotifications: state.notifications.filter(n => !n.is_read).length,
      loading: state.loading
    });
  }, [state.selectedConversation, state.conversations, state.messages, state.notifications, state.loading]);

  // ✅ CORRECTION: Ajout de setNotifications manquant
  const setNotifications = useCallback((notifications) => {
    console.log('🔔 setNotifications - Count:', notifications.length);
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
  }, []);

  // ✅ CORRECTION: Chargement des notifications amélioré
  const loadNotifications = useCallback(async () => {
    try {
      console.log('🔄 loadNotifications - Début');
      const response = await chatService.getNotifications();
      
      console.log('📡 loadNotifications - Réponse complète:', response);
      
      // ✅ CORRECTION: Gestion robuste de la réponse
      if (response && response.data) {
        if (response.data.success) {
          // Structure 1: response.data.data.notifications
          if (response.data.data && response.data.data.notifications) {
            console.log('✅ loadNotifications - Structure data.notifications');
            setNotifications(response.data.data.notifications);
          } 
          // Structure 2: response.data.notifications
          else if (response.data.notifications) {
            console.log('✅ loadNotifications - Structure notifications directe');
            setNotifications(response.data.notifications);
          }
          // Structure 3: response.data (array direct)
          else if (Array.isArray(response.data)) {
            console.log('✅ loadNotifications - Structure array directe');
            setNotifications(response.data);
          }
          // Structure inattendue
          else {
            console.warn('⚠️ loadNotifications - Structure inattendue, utilisation tableau vide');
            setNotifications([]);
          }
        } else {
          console.warn('⚠️ loadNotifications - success: false', response.data);
          setNotifications([]);
        }
      } else {
        console.error('❌ loadNotifications - Réponse invalide:', response);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ loadNotifications - Erreur:', error);
      // Ne pas casser l'application en cas d'erreur
      setNotifications([]);
    }
  }, [setNotifications]);

  // Fonctions dispatch avec useCallback
  const setConversations = useCallback((conversations) => {
    console.log('📋 setConversations - Count:', conversations.length);
    dispatch({ type: 'SET_CONVERSATIONS', payload: conversations });
  }, []);

  const setSelectedConversation = useCallback((conversation) => {
    console.log('🎯 setSelectedConversation - Conversation:', conversation?._id);
    dispatch({ type: 'SET_SELECTED_CONVERSATION', payload: conversation });
  }, []);

  const setMessages = useCallback((messages) => {
    console.log('💬 setMessages - Count:', messages.length);
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  }, []);

  const addMessage = useCallback((message) => {
    console.log('📨 addMessage - Message ID:', message._id, 'Conversation:', message.conversation_id);
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const updateMessage = useCallback((messageId, updates) => {
    console.log('🔄 updateMessage - Message:', messageId, 'Updates:', updates);
    dispatch({ type: 'UPDATE_MESSAGE', payload: { messageId, updates } });
  }, []);

  const updateMessageStatus = useCallback((messageId, status) => {
    console.log('📊 updateMessageStatus - Message:', messageId, 'Status:', status);
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { messageId, status } });
  }, []);

  const addNotification = useCallback((notification) => {
    console.log('🔔 addNotification - Notification:', notification?._id);
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  const setActiveCall = useCallback((call) => {
    dispatch({ type: 'SET_ACTIVE_CALL', payload: call });
  }, []);

  const setLoading = useCallback((loading) => {
    console.log('⏳ setLoading:', loading);
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    console.log('❌ setError:', error);
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearChat = useCallback(() => {
    console.log('🧹 clearChat - Reset complet');
    dispatch({ type: 'CLEAR_CHAT' });
  }, []);

  const disconnectChat = useCallback(() => {
    console.log('🔌 disconnectChat - Déconnexion manuelle Socket.IO');
    socketService.disconnect();
    clearChat();
  }, [clearChat]);

  // Fonctions pour les conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 loadConversations - Début');
      const response = await chatService.getConversations();
      console.log('✅ loadConversations - Réussi:', response.data.conversations.length);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('❌ loadConversations - Erreur:', error);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConversations, setError]);

  const createConversation = useCallback(async (conversationData) => {
    try {
      setLoading(true);
      console.log('🔄 createConversation - Début:', conversationData);
      const response = await chatService.createConversation(conversationData);
      
      const newConversation = response.data.conversation;
      console.log('✅ createConversation - Créée:', newConversation._id);
      
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      
      return newConversation;
    } catch (error) {
      console.error('❌ createConversation - Erreur:', error);
      setError('Erreur lors de la création de la conversation');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConversations, setSelectedConversation, setError]);

  const updateConversationLastMessage = useCallback((conversationId, message) => {
    console.log('🔄 updateConversationLastMessage - Conversation:', conversationId, 'Message:', message?._id);
    
    const currentConversations = stateRef.current.conversations;
    const updatedConversations = currentConversations.map(conv => 
      conv._id === conversationId 
        ? { 
            ...conv, 
            last_message: message, 
            updated_at: new Date().toISOString() 
          }
        : conv
    );
    
    setConversations(updatedConversations);
  }, [setConversations]);

  // ✅ CORRECTION CRITIQUE: Fonction sendMessage améliorée
  const sendMessage = useCallback(async (messageData) => {
    let tempMessage;
    
    try {
      console.log('🟢 sendMessage - Début - Conversation:', messageData.conversation_id);
      
      if (!messageData.conversation_id) {
        console.error('❌ sendMessage - Aucun conversation_id fourni');
        throw new Error('Aucune conversation sélectionnée');
      }

      if (!currentUser || !currentUser._id) {
        console.error('❌ sendMessage - currentUser non défini');
        throw new Error('Utilisateur non connecté');
      }
      
      // ✅ CORRECTION : Créer un ID temporaire UNIQUE
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      tempMessage = {
        _id: tempId,
        ...messageData,
        sender_id: {
          _id: currentUser._id,
          name: currentUser.name,
          profile_picture: currentUser.profile_picture
        },
        message_status: 'sending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        isTemp: true
      };

      console.log('📝 sendMessage - Message temporaire créé:', tempMessage._id);
      
      // ✅ CORRECTION : Ajouter immédiatement le message temporaire
      addMessage(tempMessage);
      
      console.log('📤 sendMessage - Envoi via API HTTP');
      
      // ✅ CORRECTION : Envoyer via API HTTP avec tempId
      const response = await chatService.sendMessage({
        ...messageData,
        tempId: tempId
      });
      
      console.log('✅ sendMessage - Réponse API:', response.data);
      
      if (response.data.data) {
        const realMessage = response.data.data;
        console.log('🔄 sendMessage - Remplacement message temporaire:', tempId, 'par:', realMessage._id);
        
        // ✅ CORRECTION CRITIQUE : Mettre à jour le message existant au lieu de remplacer tout le tableau
        updateMessage(tempId, {
          ...realMessage,
          _id: realMessage._id,
          isTemp: false,
          message_status: 'sent'
        });
        
        updateConversationLastMessage(messageData.conversation_id, realMessage);
        
        console.log('✅ sendMessage - Message mis à jour avec succès');
      }

      return response.data.data;
      
    } catch (error) {
      console.error('❌ sendMessage - Erreur:', error);
      
      if (tempMessage) {
        console.log('⚠️ sendMessage - Marquer message comme erreur');
        updateMessage(tempMessage._id, {
          message_status: 'error',
          error: error.message
        });
      }
      
      setError('Erreur lors de l\'envoi du message');
      throw error;
    }
  }, [addMessage, updateMessage, updateConversationLastMessage, setError, currentUser]);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      setLoading(true);
      console.log('🔄 loadMessages - Conversation:', conversationId);
      const response = await chatService.getConversationMessages(conversationId);
      console.log('✅ loadMessages - Messages chargés:', response.data.messages.length);
      
      // ✅ CORRECTION : Filtrer les messages temporaires lors du chargement
      const realMessages = Array.isArray(response.data.messages) 
        ? response.data.messages.filter(msg => !msg.isTemp)
        : [];
      
      setMessages(realMessages);
      
      socketService.joinConversation(conversationId);
    } catch (error) {
      console.error('❌ loadMessages - Erreur:', error);
      setError('Erreur lors du chargement des messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setMessages, setError]);

  const markMessagesAsRead = useCallback((conversationId) => {
    console.log('👀 markMessagesAsRead - Conversation:', conversationId);
    socketService.markAsRead(conversationId);
    chatService.markMessagesAsRead(conversationId);
  }, []);

  // ✅ CORRECTION: Fonction pour obtenir les notifications non lues par conversation
  const getUnreadNotificationsCount = useCallback((conversationId = null) => {
    try {
      if (!state.notifications || !Array.isArray(state.notifications)) {
        console.warn('⚠️ getUnreadNotificationsCount - notifications non défini ou pas un tableau');
        return 0;
      }

      if (conversationId) {
        const unreadNotifications = state.notifications.filter(notif => {
          if (!notif || typeof notif !== 'object') return false;
          
          // ✅ CORRECTION: Gestion robuste des conversation_id
          let notifConversationId;
          if (notif.conversation_id) {
            if (typeof notif.conversation_id === 'object') {
              notifConversationId = notif.conversation_id._id || notif.conversation_id;
            } else {
              notifConversationId = notif.conversation_id;
            }
          }
          
          const isSameConversation = notifConversationId === conversationId;
          const isUnread = notif.is_read === false;
          
          return isSameConversation && isUnread;
        });

        console.log(`🔍 GET_UNREAD_COUNT - Conversation: ${conversationId}`);
        console.log(`   📋 Total notifications: ${state.notifications.length}`);
        console.log(`   🔵 Non lues: ${unreadNotifications.length}`);
        
        return unreadNotifications.length;
      } else {
        const totalUnread = state.notifications.filter(notif => 
          notif && notif.is_read === false
        ).length;
        
        console.log(`🔍 GET_UNREAD_COUNT - Général: ${totalUnread} non lues sur ${state.notifications.length} total`);
        return totalUnread;
      }
    } catch (error) {
      console.error('❌ getUnreadNotificationsCount - Erreur:', error);
      return 0;
    }
  }, [state.notifications]);

  // ✅ CORRECTION: Marquer les notifications d'une conversation comme lues
  const markConversationNotificationsAsRead = useCallback(async (conversationId) => {
    try {
      console.log('🎯 MARK_CONVERSATION_READ - Début pour conversation:', conversationId);
      
      if (!conversationId) {
        console.error('❌ MARK_CONVERSATION_READ - conversationId manquant');
        return;
      }

      // Trouver les IDs des notifications non lues pour cette conversation
      const notificationIds = state.notifications
        .filter(notif => {
          if (!notif || !notif._id) return false;
          
          let notifConversationId;
          if (notif.conversation_id) {
            if (typeof notif.conversation_id === 'object') {
              notifConversationId = notif.conversation_id._id || notif.conversation_id;
            } else {
              notifConversationId = notif.conversation_id;
            }
          }
          
          return notifConversationId === conversationId && notif.is_read === false;
        })
        .map(notif => notif._id);

      console.log('📋 Notifications à marquer comme lues:', notificationIds);

      if (notificationIds.length === 0) {
        console.log('ℹ️ Aucune notification non lue à marquer');
        return;
      }

      // Appel API pour marquer comme lues
      await chatService.markNotificationsAsRead(notificationIds);
      
      // Mise à jour locale immédiate
      setNotifications(prev => 
        prev.map(notif => {
          if (!notif._id) return notif;
          
          let notifConversationId;
          if (notif.conversation_id) {
            if (typeof notif.conversation_id === 'object') {
              notifConversationId = notif.conversation_id._id || notif.conversation_id;
            } else {
              notifConversationId = notif.conversation_id;
            }
          }
          
          if (notifConversationId === conversationId && notif.is_read === false) {
            return { ...notif, is_read: true };
          }
          return notif;
        })
      );

      console.log('✅ MARK_CONVERSATION_READ - Terminé avec succès');

    } catch (error) {
      console.error('❌ MARK_CONVERSATION_READ - Erreur:', error);
    }
  }, [state.notifications, setNotifications]);

  const markNotificationsAsRead = useCallback(async (notificationIds) => {
    try {
      console.log('👀 markNotificationsAsRead - IDs:', notificationIds);
      await chatService.markNotificationsAsRead(notificationIds);
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif._id) 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('❌ markNotificationsAsRead - Erreur:', error);
    }
  }, [setNotifications]);

  const getNotificationsByConversation = useCallback((conversationId) => {
    return state.notifications.filter(notif => {
      const notifConversationId = typeof notif.conversation_id === 'object' 
        ? notif.conversation_id._id 
        : notif.conversation_id;
      return notifConversationId === conversationId;
    });
  }, [state.notifications]);

  // Fonctions pour les appels
  const startCall = useCallback(async (callData) => {
    try {
      console.log('📞 startCall - Début:', callData);
      const response = await chatService.startCall(callData);
      socketService.initiateCall(callData);
      setActiveCall(response.data.call);
      return response.data.call;
    } catch (error) {
      console.error('❌ startCall - Erreur:', error);
      setError('Erreur lors du démarrage de l\'appel');
      throw error;
    }
  }, [setActiveCall, setError]);

  const endCall = useCallback(async (callId) => {
    try {
      console.log('📞 endCall - Call ID:', callId);
      await chatService.updateCall(callId, { call_status: 'ended' });
      socketService.endCall(callId);
      setActiveCall(null);
    } catch (error) {
      console.error('❌ endCall - Erreur:', error);
    }
  }, [setActiveCall]);

  // ✅ CORRECTION CRITIQUE: Configuration des écouteurs Socket.IO
  const setupSocketListeners = useCallback(() => {
    console.log('🔧 setupSocketListeners - Configuration');
    
    // NETTOYAGE: Supprimer tous les anciens listeners
    socketService.socket?.off('new_message');
    socketService.socket?.off('message_sent');
    socketService.socket?.off('messages_read');
    socketService.socket?.off('new_notification');
    socketService.socket?.off('incoming_call');
    socketService.socket?.off('call_accepted');
    socketService.socket?.off('call_ended');

    // ✅ NOUVEAU: Événement message_sent pour confirmation d'envoi
    socketService.onMessageSent((data) => {
      console.log('✅ Socket - Message envoyé confirmé:', data);
      if (data.tempId && data.message) {
        updateMessage(data.tempId, {
          ...data.message,
          _id: data.message._id,
          isTemp: false,
          message_status: 'sent'
        });
      }
    });

    // Écouteur pour nouveaux messages
    socketService.onNewMessage((messageData) => {
      console.log('📨 Socket - Nouveau message reçu:', messageData);
      
      if (!messageData || !messageData.message || !messageData.message._id) {
        console.error('❌ Socket - Message invalide reçu:', messageData);
        return;
      }
      
      const message = messageData.message;
      const currentSelectedConv = stateRef.current.selectedConversation;
      
      console.log('🔍 Socket - Conversation sélectionnée:', currentSelectedConv?._id);
      console.log('🔍 Socket - Conversation message:', message.conversation_id);
      
      if (currentSelectedConv && message.conversation_id === currentSelectedConv._id) {
        console.log('✅ Socket - Ajout message à conversation active');
        addMessage(message);
      } else {
        console.log('ℹ️ Socket - Message pour autre conversation');
      }
      
      updateConversationLastMessage(message.conversation_id, message);
    });

    socketService.onMessageRead((data) => {
      console.log('👀 Socket - Messages lus:', data);
      const currentSelectedConv = stateRef.current.selectedConversation;
      if (currentSelectedConv && data.conversationId === currentSelectedConv._id) {
        stateRef.current.messages.forEach(message => {
          if (message.sender_id && message.sender_id._id !== currentUser?._id) {
            updateMessageStatus(message._id, 'read');
          }
        });
      }
    });

    socketService.onNewNotification((notification) => {
      console.log('🔔 Socket - Nouvelle notification:', notification);
      addNotification(notification);
      
      // Recharger automatiquement les conversations quand nouvelle notification arrive
      setTimeout(() => {
        loadConversations();
      }, 200);
    });

    socketService.onIncomingCall((callData) => {
      console.log('📞 Socket - Appel entrant:', callData);
      setActiveCall(callData);
    });

    socketService.onCallAccepted((data) => {
      console.log('✅ Socket - Appel accepté:', data);
    });

    socketService.onCallEnded((data) => {
      console.log('❌ Socket - Appel terminé:', data);
      setActiveCall(null);
    });

    return () => {
      console.log('🧹 Nettoyage des listeners Socket');
      socketService.socket?.off('new_message');
      socketService.socket?.off('message_sent');
      socketService.socket?.off('messages_read');
      socketService.socket?.off('new_notification');
      socketService.socket?.off('incoming_call');
      socketService.socket?.off('call_accepted');
      socketService.socket?.off('call_ended');
    };
  }, [currentUser, addMessage, updateMessage, updateMessageStatus, updateConversationLastMessage, addNotification, setActiveCall, loadConversations]);

  const handleSelectConversation = useCallback((conversation) => {
    console.log('🎯 HANDLE_SELECT_CONVERSATION - Début');
    console.log('   📝 Conversation:', conversation?._id);
    console.log('   📝 Ancienne conversation:', stateRef.current.selectedConversation?._id);
    
    setSelectedConversation(conversation);
    
    if (conversation) {
      console.log('🔄 Chargement messages...');
      loadMessages(conversation._id);
      markMessagesAsRead(conversation._id);
      
      console.log('🔔 Marquage notifications comme lues...');
      markConversationNotificationsAsRead(conversation._id);
      
    } else {
      console.log('🧹 Conversation null, vidage messages');
      setMessages([]);
    }
  }, [setSelectedConversation, loadMessages, setMessages, markMessagesAsRead, markConversationNotificationsAsRead]);

  // ✅ CORRECTION CRITIQUE: useEffect avec gestion des reconnexions
  useEffect(() => {
    let cleanupSocketListeners = () => {};

    if (isAuth && currentUser) {
      if (!socketService.getConnectionStatus()) {
        console.log('🔗 ChatProvider - Connexion Socket.IO');
        socketService.connect();
        console.log('✅ ChatProvider - Socket.IO connecté');
        
        const setupAfterConnection = () => {
          cleanupSocketListeners = setupSocketListeners();
          loadConversations();
          loadNotifications(); // ✅ Charger les notifications au démarrage
        };

        if (socketService.socket?.connected) {
          setupAfterConnection();
        } else {
          const connectionHandler = () => {
            setupAfterConnection();
            socketService.socket?.off('connect', connectionHandler);
          };
          
          socketService.socket?.on('connect', connectionHandler);
        }
      } else {
        console.log('🔗 ChatProvider - Socket.IO déjà connecté');
        cleanupSocketListeners = setupSocketListeners();
        loadConversations();
        loadNotifications(); // ✅ Charger les notifications si déjà connecté
      }
    }

    return () => {
      console.log('🔌 ChatProvider - Cleanup effect');
      cleanupSocketListeners();
    };
  }, [isAuth, currentUser, setupSocketListeners, loadConversations, loadNotifications]);

  const value = {
    // State
    ...state,
    
    // Conversations
    loadConversations,
    createConversation,
    setSelectedConversation: handleSelectConversation,
    
    // Messages
    loadMessages,
    sendMessage,
    addMessage,
    updateMessage,
    markMessagesAsRead,
    
    // ✅ NOTIFICATIONS CORRIGÉES
    loadNotifications,
    markNotificationsAsRead,
    markConversationNotificationsAsRead,
    getUnreadNotificationsCount,
    getNotificationsByConversation,
    
    // Appels
    startCall,
    endCall,
    
    // Utilitaires
    clearChat,
    disconnectChat,
    setError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
