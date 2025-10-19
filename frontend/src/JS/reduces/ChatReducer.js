
// reducers/ChatReducer.js
export const ChatActionTypes = {
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  SET_SELECTED_CONVERSATION: 'SET_SELECTED_CONVERSATION', 
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  UPDATE_MESSAGE_STATUS: 'UPDATE_MESSAGE_STATUS',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  SET_ACTIVE_CALL: 'SET_ACTIVE_CALL',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_CHAT: 'CLEAR_CHAT'
};

export const initialState = {
  conversations: [],
  selectedConversation: null,
  messages: [],
  notifications: [],
  activeCall: null,
  loading: false,
  error: null
};

const chatReducer = (state = initialState, action) => {
  console.log('🔄 ChatReducer - Action:', action.type, 'Payload:', action.payload);
  
  switch (action.type) {
    case ChatActionTypes.SET_CONVERSATIONS:
      let conversationsPayload;
      if (typeof action.payload === 'function') {
        console.log('🔄 SET_CONVERSATIONS - Application fonction sur état actuel');
        conversationsPayload = action.payload(state.conversations);
      } else {
        conversationsPayload = Array.isArray(action.payload) ? action.payload : [];
      }
      console.log('📋 SET_CONVERSATIONS - Count:', conversationsPayload.length);
      return { ...state, conversations: conversationsPayload };
      
    case ChatActionTypes.SET_SELECTED_CONVERSATION:
      console.log('🎯 SET_SELECTED_CONVERSATION - Nouvelle conversation:', action.payload?._id);
      return { ...state, selectedConversation: action.payload };
      
    case ChatActionTypes.SET_MESSAGES:
      let messagesPayload;
      if (typeof action.payload === 'function') {
        console.log('🔄 SET_MESSAGES - Application fonction sur état actuel');
        messagesPayload = action.payload(state.messages);
      } else {
        messagesPayload = Array.isArray(action.payload) ? action.payload : [];
      }
      console.log('💬 SET_MESSAGES - Messages:', messagesPayload.length);
      return { ...state, messages: messagesPayload };
      
    case ChatActionTypes.ADD_MESSAGE:
      if (!action.payload || !action.payload._id) {
        console.error('❌ ADD_MESSAGE - Message invalide:', action.payload);
        return state;
      }
      console.log('📨 ADD_MESSAGE - Message ID:', action.payload._id);
      
      // ✅ CORRECTION : Éviter les doublons
      const messageExists = state.messages.some(msg => msg._id === action.payload._id);
      if (messageExists) {
        console.log('⚠️ ADD_MESSAGE - Message déjà existant, ignoré');
        return state;
      }
      
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
      
    case ChatActionTypes.UPDATE_MESSAGE:
      if (!action.payload.messageId || !action.payload.updates) {
        console.error('❌ UPDATE_MESSAGE - Payload invalide:', action.payload);
        return state;
      }
      
      console.log('🔄 UPDATE_MESSAGE - Message ID:', action.payload.messageId);
      
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload.messageId 
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
      
    case ChatActionTypes.UPDATE_MESSAGE_STATUS:
      if (!action.payload.messageId || !action.payload.status) {
        console.error('❌ UPDATE_MESSAGE_STATUS - Payload invalide:', action.payload);
        return state;
      }
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg._id === action.payload.messageId 
            ? { ...msg, message_status: action.payload.status }
            : msg
        )
      };
      
    case ChatActionTypes.SET_NOTIFICATIONS:
      const notifications = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, notifications };
      
    case ChatActionTypes.ADD_NOTIFICATION:
      if (!action.payload || !action.payload._id) {
        console.error('❌ ADD_NOTIFICATION - Notification invalide:', action.payload);
        return state;
      }
      
      // ✅ CORRECTION : Éviter les doublons de notifications
      const notificationExists = state.notifications.some(notif => notif._id === action.payload._id);
      if (notificationExists) {
        console.log('⚠️ ADD_NOTIFICATION - Notification déjà existante, ignorée');
        return state;
      }
      
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications] 
      };
      
    case ChatActionTypes.SET_ACTIVE_CALL:
      return { ...state, activeCall: action.payload };
      
    case ChatActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ChatActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ChatActionTypes.CLEAR_CHAT:
      console.log('🧹 CLEAR_CHAT - Reset complet');
      return { 
        ...initialState
      };
      
    default:
      return state;
  }
};

export default chatReducer; 

