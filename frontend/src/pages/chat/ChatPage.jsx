

// pages/ChatPage.js
import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useChat } from '../../context/ChatContext';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import './Chat.css';

const ChatPage = () => {
  const { 
    conversations, 
    selectedConversation, 
    messages,
    setSelectedConversation,
    clearChat
  } = useChat();

  // ✅ CORRECTION: Réinitialiser la conversation sélectionnée au chargement de la page
  useEffect(() => {
    console.log('🔄 ChatPage - Réinitialisation au chargement');
    // Réinitialiser la conversation sélectionnée quand on arrive sur la page
    setSelectedConversation(null);
  }, [setSelectedConversation]);

  return (
    <Container fluid className="chat-page">
      <Row className="chat-layout">
        {/* Sidebar des conversations */}
        <Col md={4} className="chat-sidebar-container">
          <ChatSidebar 
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </Col>
        
        {/* Fenêtre de chat principale */}
        <Col md={8} className="chat-window-container">
          {selectedConversation ? (
            <ChatWindow 
              conversation={selectedConversation}
              messages={messages}
            />
          ) : (
            <div className="chat-welcome">
              <div className="welcome-content text-center">
                <div className="welcome-icon mb-4">
                  <span style={{ fontSize: '4rem' }}>💬</span>
                </div>
                <h3>Bienvenue dans la messagerie</h3>
                <p className="text-muted mb-4">
                  Sélectionnez une conversation pour commencer à discuter
                </p>
                <div className="welcome-features">
                  <h5 className="mb-3">Fonctionnalités disponibles :</h5>
                  <div className="features-list">
                    <div className="feature-item mb-2">
                      <span className="feature-icon">✅</span>
                      <span>Messages en temps réel</span>
                    </div>
                    <div className="feature-item mb-2">
                      <span className="feature-icon">✅</span>
                      <span>Conversations privées et groupes</span>
                    </div>
                    <div className="feature-item mb-2">
                      <span className="feature-icon">✅</span>
                      <span>Partage de fichiers et images</span>
                    </div>
                    <div className="feature-item mb-2">
                      <span className="feature-icon">✅</span>
                      <span>Appels audio et vidéo</span>
                    </div>
                    <div className="feature-item mb-2">
                      <span className="feature-icon">✅</span>
                      <span>Notifications en temps réel</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span>Interface intuitive et moderne</span>
                    </div>
                  </div>
                </div>
                
                {conversations.length === 0 && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <p className="mb-2">
                      <strong>💡 Conseil :</strong> Vous n'avez aucune conversation pour le moment.
                    </p>
                    <p className="mb-0">
                      Créez une nouvelle conversation en cliquant sur le bouton <strong>"+"</strong> dans la barre latérale.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ChatPage;