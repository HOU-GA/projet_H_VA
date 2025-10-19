
// components/chat/ChatWindow.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Card, 
  InputGroup, 
  FormControl, 
  Button,
  Dropdown,
  Alert,
  Spinner
} from 'react-bootstrap';
import MessageBubble from './MessageBubble';
import { useChat } from '../../context/ChatContext';
import { useSelector } from 'react-redux';

const ChatWindow = ({ conversation, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setLocalError] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { sendMessage } = useChat();
  const currentUser = useSelector(state => state.authReducer.user);

  // ✅ CORRECTION : Gestion robuste des messages avec tri
  const safeMessages = useMemo(() => {
    console.log('🔍 ChatWindow - Messages reçus:', messages?.length || 0);
    
    if (!messages) {
      return [];
    }
    
    if (!Array.isArray(messages)) {
      console.error('❌ ChatWindow: messages n\'est pas un tableau');
      return [];
    }
    
    // Filtrer les messages valides
    const validMessages = messages.filter(msg => {
      const isValid = msg && 
        msg._id && 
        msg.conversation_id && 
        msg.sender_id &&
        (msg.message_text || msg.media_url);
      
      return isValid;
    });
    
    // Trier par date de création (plus ancien en premier)
    const sortedMessages = validMessages.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    console.log('✅ ChatWindow - Messages valides et triés:', sortedMessages.length);
    
    return sortedMessages;
  }, [messages]);

  // ✅ CORRECTION : Scroll intelligent
  useEffect(() => {
    if (safeMessages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [safeMessages]);

  // ✅ CORRECTION : Fonction d'envoi améliorée avec gestion d'erreur
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) {
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setLocalError('');

    const messageData = {
      conversation_id: conversation._id,
      message_type: 'text',
      message_text: messageText
    };

    console.log('🟢 ChatWindow - Envoi message:', messageData);

    try {
      await sendMessage(messageData);
      console.log('✅ ChatWindow - Message envoyé avec succès');
    } catch (error) {
      console.error('❌ ChatWindow - Erreur envoi message:', error);
      setLocalError(error.message || 'Erreur lors de l\'envoi du message');
      // Remettre le message en cas d'erreur
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isOwnMessage = (message) => {
    if (!message || !message.sender_id || !currentUser) {
      return false;
    }
    
    const senderId = typeof message.sender_id === 'object' 
      ? message.sender_id._id 
      : message.sender_id;
    
    return senderId === currentUser._id;
  };

  const getConversationTitle = () => {
    if (!conversation) return 'Sélectionnez une conversation';
    
    if (conversation.conversation_type === 'group') {
      return conversation.group_name || 'Groupe sans nom';
    } else {
      const otherUsers = conversation.participants?.filter(p => 
        p && p._id && p._id !== currentUser?._id
      ) || [];
      
      if (otherUsers.length === 0) return 'Conversation privée';
      
      return otherUsers.map(user => user.name || 'Utilisateur inconnu').join(', ');
    }
  };

  const getParticipantCount = () => {
    if (!conversation || !conversation.participants) return '0 membres';
    
    const validParticipants = conversation.participants.filter(p => p && p._id);
    return `${validParticipants.length} membre${validParticipants.length > 1 ? 's' : ''}`;
  };

  if (!conversation) {
    return (
      <Card className="chat-window h-100 d-flex align-items-center justify-content-center">
        <div className="text-center text-muted">
          <h5>💬 Bienvenue dans le chat</h5>
          <p>Sélectionnez une conversation pour commencer à discuter</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="chat-window h-100">
      {/* En-tête de la conversation */}
      <Card.Header className="chat-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="chat-avatar me-3">
            {conversation.conversation_type === 'group' ? '👥' : '👤'}
          </div>
          <div>
            <h6 className="mb-0">{getConversationTitle()}</h6>
            <small className="text-muted">
              {conversation.conversation_type === 'group' 
                ? getParticipantCount()
                : 'En ligne'
              }
            </small>
          </div>
        </div>
        
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            ⋮
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>📞 Appel audio</Dropdown.Item>
            <Dropdown.Item>🎥 Appel vidéo</Dropdown.Item>
            <Dropdown.Item>👥 Détails du groupe</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Card.Header>

      {/* Zone des messages */}
      <Card.Body className="chat-messages p-0">
        <div 
          ref={messagesContainerRef}
          className="messages-container" 
          style={{ 
            height: '400px', 
            overflowY: 'auto', 
            padding: '15px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {safeMessages.length === 0 ? (
            <div className="no-messages text-center text-muted p-4">
              <p>Aucun message dans cette conversation</p>
              <small>Soyez le premier à envoyer un message !</small>
            </div>
          ) : (
            safeMessages.map(message => (
              <MessageBubble 
                key={message._id} 
                message={message}
                isOwn={isOwnMessage(message)}
                isSending={message.message_status === 'sending'}
                hasError={message.message_status === 'error'}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card.Body>

      {/* Input pour écrire */}
      <Card.Footer className="chat-input">
        {error && (
          <Alert variant="danger" className="py-2 mb-2">
            <small>{error}</small>
          </Alert>
        )}
        
        <InputGroup>
          <FormControl
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!conversation || sending}
          />
          <Button 
            variant="primary" 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !conversation || sending}
          >
            {sending ? <Spinner animation="border" size="sm" /> : '📤'}
          </Button>
        </InputGroup>
        
        <div className="chat-actions mt-2">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="me-2"
            disabled={!conversation || sending}
          >
            📎
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="me-2"
            disabled={!conversation || sending}
          >
            🖼️
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm"
            disabled={!conversation || sending}
          >
            😊
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ChatWindow;

