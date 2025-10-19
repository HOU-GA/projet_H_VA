
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ListGroup, 
  InputGroup, 
  FormControl, 
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useChat } from '../../context/ChatContext';
import userService from '../../services/userService';

const ChatSidebar = ({ conversations, selectedConversation, onSelectConversation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [conversationType, setConversationType] = useState('private');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  
  // ✅ ÉTAT SIMPLE
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  // ✅ RÉFÉRENCES
  const hasPlayedInitialSound = useRef(false);
  const speechSynthesisRef = useRef(null);

  const currentUser = useSelector(state => state.authReducer.user);
  const { 
    createConversation, 
    loadConversations, 
    getUnreadNotificationsCount,
    markConversationNotificationsAsRead,
    socket
  } = useChat();

  // ✅ useMemo pour safeConversations
  const safeConversations = useMemo(() => 
    Array.isArray(conversations) ? conversations : [], 
    [conversations]
  );

  // ✅ SON DE FALLBACK
  const playFallbackSound = useCallback(() => {
    console.log('🔊 Fallback son simple');
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 600;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.stop(audioContext.currentTime + 0.5);
      
    } catch (error) {
      console.error('❌ Erreur fallback:', error);
    }
  }, []);

  // ✅ FONCTION VOIX FÉMININE AMÉLIORÉE
  const playFemaleVoiceNotification = useCallback(() => {
    if (!isSoundEnabled) {
      console.log('🔇 Son désactivé');
      return;
    }

    console.log('👩 TENTATIVE VOIX FÉMININE');

    // Arrêter toute lecture en cours
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }

    if (!('speechSynthesis' in window)) {
      console.log('❌ API Speech non supportée');
      playFallbackSound();
      return;
    }

    try {
      const message = new SpeechSynthesisUtterance();
      message.text = "Vous avez un nouveau message";
      message.volume = 1.0;
      message.rate = 0.9;
      message.pitch = 1.2;

      // Charger les voix disponibles
      const voices = window.speechSynthesis.getVoices();
      
      // Chercher une voix féminine
      let femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('female') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Alice') ||
        voice.name.includes('Zira') ||
        voice.name.includes('Hélène') ||
        (voice.lang.includes('fr') && voice.name.toLowerCase().includes('female'))
      );

      // Si pas de voix féminine spécifique, prendre une voix française
      if (!femaleVoice) {
        femaleVoice = voices.find(voice => voice.lang.includes('fr'));
      }

      // Si toujours pas, prendre la première voix disponible
      if (!femaleVoice && voices.length > 0) {
        femaleVoice = voices[0];
      }

      if (femaleVoice) {
        message.voice = femaleVoice;
        console.log('🎙️ Voix utilisée:', femaleVoice.name, femaleVoice.lang);
      }

      // Événements pour le débogage
      message.onstart = () => {
        console.log('✅ Début de la parole');
        speechSynthesisRef.current = message;
      };

      message.onend = () => {
        console.log('✅ Fin de la parole');
        speechSynthesisRef.current = null;
      };

      message.onerror = (event) => {
        console.error('❌ Erreur synthèse vocale:', event);
        playFallbackSound();
      };

      // Lancer la synthèse
      window.speechSynthesis.speak(message);

    } catch (error) {
      console.error('❌ Erreur critique synthèse vocale:', error);
      playFallbackSound();
    }
  }, [isSoundEnabled, playFallbackSound]);

  // ✅ EFFET PRINCIPAL - DÉCLENCHÉ QUAND ON CLIQUE SUR "MESSAGES"
  useEffect(() => {
    console.log('🎯 EFFET PRINCIPAL - Conversations:', safeConversations.length);

    // Conditions basiques
    if (safeConversations.length === 0) {
      console.log('📭 Aucune conversation chargée');
      return;
    }

    if (hasPlayedInitialSound.current) {
      console.log('🔇 Son déjà joué');
      return;
    }

    if (!isSoundEnabled) {
      console.log('🔇 Son désactivé');
      return;
    }

    // Calculer les messages non lus
    const totalUnread = safeConversations.reduce((total, conv) => {
      return total + getUnreadNotificationsCount(conv._id);
    }, 0);

    console.log('📨 Messages non lus totaux:', totalUnread);

    if (totalUnread > 0) {
      console.log('🚨 DÉCLENCHEMENT VOIX FÉMININE - Messages non lus:', totalUnread);
      
      // Délai court pour laisser l'interface se charger
      const timer = setTimeout(() => {
        console.log('👩 LANCEMENT VOIX FÉMININE MAINTENANT');
        playFemaleVoiceNotification();
        hasPlayedInitialSound.current = true;
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log('🔇 Aucun message non lu');
      hasPlayedInitialSound.current = true;
    }
  }, [safeConversations, isSoundEnabled, getUnreadNotificationsCount, playFemaleVoiceNotification]);

  // ✅ NOTIFICATIONS TEMPS RÉEL
  useEffect(() => {
    if (!socket || !isSoundEnabled) return;

    console.log('🔌 Configuration notifications temps réel');

    const handleNewMessage = (messageData) => {
      if (!messageData?._id) return;

      // Vérifier que c'est un message de quelqu'un d'autre
      const senderId = messageData.sender_id?._id || messageData.sender_id;
      if (senderId === currentUser?._id) {
        console.log('🔇 Mon propre message - Ignorer');
        return;
      }

      console.log('👩 NOUVEAU MESSAGE REÇU - Voix féminine');
      playFemaleVoiceNotification();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, isSoundEnabled, currentUser, playFemaleVoiceNotification]);

  // ✅ RÉINITIALISATION À LA DÉCONNEXION/CONNEXION
  useEffect(() => {
    if (currentUser) {
      console.log('🔄 NOUVELLE SESSION - Réinitialisation');
      hasPlayedInitialSound.current = false;
      
      // Arrêter toute parole en cours
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    }
  }, [currentUser]);

  // ✅ CHARGEMENT DES VOIX AU DÉMARRAGE
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Forcer le chargement des voix
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const loadedVoices = window.speechSynthesis.getVoices();
          console.log('🎙️ Voix disponibles:', loadedVoices.map(v => `${v.name} (${v.lang})`));
        };
      } else {
        console.log('🎙️ Voix disponibles:', voices.map(v => `${v.name} (${v.lang})`));
      }
    }
  }, []);

  // ✅ FONCTIONS UTILITAIRES
  const testVoice = () => {
    console.log('🧪 TEST VOIX FÉMININE');
    playFemaleVoiceNotification();
  };

  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    
    // Arrêter toute parole en cours
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
    }
    
    console.log(newState ? '🔊 Son activé' : '🔇 Son désactivé');
  };

  // ✅ CORRECTION: Fonction pour obtenir le total des messages non lus
  const getTotalUnreadMessages = useCallback(() => {
    try {
      if (!getUnreadNotificationsCount) {
        console.warn('⚠️ getUnreadNotificationsCount non disponible');
        return 0;
      }
      
      const total = safeConversations.reduce((total, conv) => {
        if (!conv || !conv._id) return total;
        return total + getUnreadNotificationsCount(conv._id);
      }, 0);
      
      console.log(`📊 Total messages non lus: ${total}`);
      return total;
    } catch (error) {
      console.error('❌ Erreur getTotalUnreadMessages:', error);
      return 0;
    }
  }, [safeConversations, getUnreadNotificationsCount]);

  // ✅ CORRECTION: Vérifier si une conversation a des messages non lus
  const hasUnreadMessages = useCallback((conversation) => {
    if (!conversation || !conversation._id) return false;
    
    const unreadCount = getUnreadNotificationsCount(conversation._id);
    const hasUnread = unreadCount > 0;
    
    if (hasUnread) {
      console.log(`💬 Conversation ${conversation._id} a ${unreadCount} messages non lus`);
    }
    
    return hasUnread;
  }, [getUnreadNotificationsCount]);

  // ✅ CORRECTION: Effet pour surveiller les changements de notifications
  useEffect(() => {
    console.log('🔔 ChatSidebar - Conversations mises à jour:', safeConversations.length);
    
    // Log détaillé du statut de lecture de chaque conversation
    safeConversations.forEach(conv => {
      const unreadCount = getUnreadNotificationsCount(conv._id);
      if (unreadCount > 0) {
        console.log(`   📍 ${conv.group_name || 'Conversation privée'}: ${unreadCount} non lus`);
      }
    });
  }, [safeConversations, getUnreadNotificationsCount]);

  // ✅ CHARGER LES UTILISATEURS
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const response = await userService.getUsersForChat();
        if (response.data.success) {
          const filteredUsers = response.data.users.filter(user => 
            user._id !== currentUser?._id
          );
          setAllUsers(filteredUsers);
        }
      } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
      }
    };

    if (currentUser?._id) {
      loadAllUsers();
    }
  }, [currentUser?._id]);

  // ✅ CHARGER LES UTILISATEURS POUR LE MODAL
  useEffect(() => {
    const loadUsers = async () => {
      if (showNewChatModal) {
        try {
          setLoadingUsers(true);
          const response = await userService.getUsersForChat();
          if (response.data.success) {
            const filteredUsers = response.data.users.filter(user => 
              user._id !== currentUser?._id
            );
            setAvailableUsers(filteredUsers);
          }
        } catch (error) {
          console.error('❌ Erreur chargement utilisateurs:', error);
          setError('Erreur lors du chargement des utilisateurs');
        } finally {
          setLoadingUsers(false);
        }
      }
    };

    if (showNewChatModal && currentUser?._id) {
      loadUsers();
    }
  }, [showNewChatModal, currentUser?._id]);

  // ✅ FONCTIONS DE RECHERCHE
  const filterUsersBySearchTerm = (users, searchTerm) => {
    if (!searchTerm.trim()) return users;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(user => {
      const nameMatch = user.name?.toLowerCase().includes(lowerSearchTerm);
      const careerMatch = user.current_career_plan?.toLowerCase().includes(lowerSearchTerm);
      const emailMatch = user.email_address?.toLowerCase().includes(lowerSearchTerm);
      return nameMatch || careerMatch || emailMatch;
    });
  };

  const filterConversationsBySearchTerm = (conversations, searchTerm) => {
    if (!searchTerm.trim()) return conversations;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return conversations.filter(conversation => {
      if (conversation.conversation_type === 'group') {
        return conversation.group_name?.toLowerCase().includes(lowerSearchTerm);
      } else {
        const otherUsers = conversation.participants?.filter(p => p._id !== currentUser?._id) || [];
        if (otherUsers.length > 0) {
          const otherUser = otherUsers[0];
          const fullUserInfo = allUsers.find(user => user._id === otherUser._id);
          const displayUser = fullUserInfo || otherUser;
          const nameMatch = displayUser.name?.toLowerCase().includes(lowerSearchTerm);
          const careerMatch = displayUser.current_career_plan?.toLowerCase().includes(lowerSearchTerm);
          const emailMatch = displayUser.email_address?.toLowerCase().includes(lowerSearchTerm);
          return nameMatch || careerMatch || emailMatch;
        }
        return false;
      }
    });
  };

  // ✅ CORRECTION: Définition de filteredAvailableUsers et filteredConversations
  const filteredAvailableUsers = filterUsersBySearchTerm(availableUsers, modalSearchTerm);
  const filteredConversations = filterConversationsBySearchTerm(safeConversations, searchTerm);

  // ✅ GESTION DES CONVERSATIONS
  const handleConversationClick = async (conversation) => {
    const unreadCount = getUnreadNotificationsCount(conversation._id);
    if (unreadCount > 0) {
      try {
        await markConversationNotificationsAsRead(conversation._id);
      } catch (error) {
        console.error('❌ Erreur marquage notifications:', error);
      }
    }
    onSelectConversation(conversation);
  };

  const handleCreateConversation = async () => {
    setLoading(true);
    setError('');
    try {
      let participants = [];
      if (conversationType === 'private') {
        if (selectedUsers.length !== 1) {
          setError('Sélectionnez un utilisateur pour une conversation privée');
          setLoading(false);
          return;
        }
        participants = [currentUser._id, selectedUsers[0]];
      } else {
        if (selectedUsers.length === 0 || !groupName.trim()) {
          setError('Nom du groupe et participants requis');
          setLoading(false);
          return;
        }
        participants = [currentUser._id, ...selectedUsers];
      }

      const conversationData = {
        conversation_type: conversationType,
        participants: participants
      };

      if (conversationType === 'group') {
        conversationData.group_name = groupName;
        conversationData.group_description = '';
      }

      await createConversation(conversationData);
      await loadConversations();
      
      setShowNewChatModal(false);
      setGroupName('');
      setSelectedUsers([]);
      setConversationType('private');
      setModalSearchTerm('');

    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
      setError(error.response?.data?.errors?.[0]?.msg || 'Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId) => {
    if (conversationType === 'private') {
      setSelectedUsers([userId]);
    } else {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    }
  };

  const getConversationDisplayInfo = (conversation) => {
    if (conversation.conversation_type === 'group') {
      return {
        name: conversation.group_name,
        picture: null,
        career: `${conversation.participants?.length || 0} participants`,
        isGroup: true
      };
    } else {
      const otherUsers = conversation.participants?.filter(p => p._id !== currentUser?._id) || [];
      if (otherUsers.length > 0) {
        const otherUser = otherUsers[0];
        const fullUserInfo = allUsers.find(user => user._id === otherUser._id);
        const displayUser = fullUserInfo || otherUser;
        return {
          name: displayUser.name || 'Utilisateur inconnu',
          picture: displayUser.profile_picture || null,
          career: displayUser.current_career_plan || 'Non spécifié',
          isGroup: false
        };
      }
      return {
        name: 'Utilisateur inconnu',
        picture: null,
        career: 'Non spécifié',
        isGroup: false
      };
    }
  };

  // ✅ CORRECTION: Ne pas afficher le contenu du message dans la liste
  const getLastMessagePreview = (conversation) => {
    const hasLastMessage = conversation.last_message && conversation.last_message.message_text;
    
    if (!hasLastMessage) {
      return 'Aucun message';
    }

    // ✅ CORRECTION: Ne pas afficher le contenu, seulement un indicateur
    const unreadCount = getUnreadNotificationsCount(conversation._id);
    
    if (unreadCount > 0) {
      return `${unreadCount} nouveau(x) message(s)`;
    } else {
      return 'Message(s) disponible(s)';
    }
  };

  const handleModalSearchChange = (e) => {
    setModalSearchTerm(e.target.value);
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header p-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Messages 
            {getTotalUnreadMessages() > 0 && (
              <Badge bg="danger" pill className="ms-2">
                {getTotalUnreadMessages()}
              </Badge>
            )}
          </h5>
          <div className="d-flex gap-2">
            <Button 
              size="sm" 
              variant={isSoundEnabled ? "outline-primary" : "outline-secondary"}
              onClick={toggleSound}
              title={isSoundEnabled ? "Désactiver les notifications vocales" : "Activer les notifications vocales"}
            >
              {isSoundEnabled ? '🔔' : '🔇'}
            </Button>

            {isSoundEnabled && (
              <Button 
                size="sm" 
                variant="outline-info"
                onClick={testVoice}
                title="Tester la voix féminine"
              >
                👩 Test
              </Button>
            )}

            <Button 
              size="sm" 
              variant="primary"
              onClick={() => setShowNewChatModal(true)}
            >
              +
            </Button>
          </div>
        </div>
        
        <InputGroup className="mt-3">
          <FormControl
            placeholder="Rechercher par nom, career plan ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <small className="text-muted mt-1 d-block">
          {isSoundEnabled ? (
            <>
              👩 <strong>Voix féminine activée</strong> - 
              {getTotalUnreadMessages() > 0 
                ? ` ${getTotalUnreadMessages()} message(s) non lu(s)` 
                : ' Aucun message non lu'
              }
            </>
          ) : (
            <>🔇 <strong>Notifications vocales désactivées</strong></>
          )}
        </small>
      </div>

      <ListGroup variant="flush" className="conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-4 text-muted">
            {searchTerm ? (
              <>
                <p>Aucune conversation trouvée</p>
                <small>Aucun résultat pour "{searchTerm}"</small>
              </>
            ) : (
              <>
                <p>Aucune conversation</p>
                <small>Créez une nouvelle conversation pour commencer</small>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const hasUnread = hasUnreadMessages(conversation);
            const unreadCount = getUnreadNotificationsCount(conversation._id);
            const displayInfo = getConversationDisplayInfo(conversation);
            
            return (
              <ListGroup.Item
                key={conversation._id}
                action
                active={selectedConversation?._id === conversation._id}
                onClick={() => handleConversationClick(conversation)}
                className={`conversation-item ${hasUnread ? 'conversation-unread' : ''}`}
                style={{
                  backgroundColor: hasUnread && selectedConversation?._id !== conversation._id 
                    ? '#f8f9fa' 
                    : 'inherit',
                  borderLeft: hasUnread ? '4px solid #007bff' : '4px solid transparent'
                }}
              >
                <div className="d-flex w-100 align-items-start">
                  <div className="conversation-avatar me-3 position-relative">
                    {displayInfo.picture ? (
                      <img 
                        src={displayInfo.picture} 
                        alt={displayInfo.name}
                        className="rounded-circle"
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: '45px',
                          height: '45px',
                          backgroundColor: displayInfo.isGroup ? '#28a745' : '#007bff',
                          fontSize: '16px'
                        }}
                      >
                        {displayInfo.isGroup ? '👥' : displayInfo.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    {hasUnread && (
                      <span 
                        className="position-absolute top-0 start-100 translate-middle p-1 bg-primary border border-light rounded-circle"
                        style={{ width: '10px', height: '10px' }}
                      >
                        <span className="visually-hidden">Nouveaux messages</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="conversation-content flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className={`conversation-name mb-1 ${hasUnread ? 'fw-bold text-dark' : ''}`}>
                          {displayInfo.name}
                        </h6>
                        <small className="text-muted">
                          {displayInfo.career}
                        </small>
                      </div>
                      <div className="text-end">
                        <small className="text-muted d-block">
                          {new Date(conversation.updated_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </small>
                        {unreadCount > 0 && (
                          <Badge bg="primary" pill className="mt-1">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* ✅ CORRECTION: Ne pas afficher le contenu du message */}
                    <p 
                      className={`conversation-preview mb-0 mt-1 ${hasUnread ? 'fw-medium text-dark' : 'text-muted'}`}
                      style={{ fontSize: '0.875rem', lineHeight: '1.3' }}
                    >
                      {getLastMessagePreview(conversation)}
                    </p>
                  </div>
                </div>
              </ListGroup.Item>
            );
          })
        )}
      </ListGroup>

      <Modal show={showNewChatModal} onHide={() => {
        setShowNewChatModal(false);
        setSelectedUsers([]);
        setGroupName('');
        setError('');
        setModalSearchTerm('');
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nouvelle conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Type de conversation</Form.Label>
              <Form.Select 
                value={conversationType}
                onChange={(e) => {
                  setConversationType(e.target.value);
                  setSelectedUsers([]);
                  setGroupName('');
                  setError('');
                }}
              >
                <option value="private">Conversation privée</option>
                <option value="group">Groupe</option>
              </Form.Select>
            </Form.Group>

            {conversationType === 'group' && (
              <Form.Group className="mb-3">
                <Form.Label>Nom du groupe</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Entrez le nom du groupe"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>
                {conversationType === 'private' 
                  ? 'Sélectionnez un utilisateur' 
                  : 'Sélectionnez les participants'
                }
              </Form.Label>
              
              <InputGroup className="mb-2">
                <FormControl
                  placeholder="Rechercher par nom, email ou current career plan..."
                  value={modalSearchTerm}
                  onChange={handleModalSearchChange}
                />
              </InputGroup>
              
              <small className="text-muted">
                🔍 Recherche par: nom, email ou current career plan
              </small>
              
              {loadingUsers ? (
                <div className="text-center p-3">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Chargement des utilisateurs...</p>
                </div>
              ) : (
                <div className="users-list" style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '5px', padding: '10px'}}>
                  {filteredAvailableUsers.length === 0 ? (
                    <div className="text-center p-3 text-muted">
                      {modalSearchTerm ? 'Aucun utilisateur trouvé avec ces critères' : 'Aucun utilisateur disponible'}
                    </div>
                  ) : (
                    filteredAvailableUsers.map(user => (
                      <div 
                        key={user._id} 
                        className={`d-flex align-items-center mb-2 p-2 ${selectedUsers.includes(user._id) ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ cursor: 'pointer', borderRadius: '5px' }}
                        onClick={() => handleUserSelection(user._id)}
                      >
                        <Form.Check
                          type={conversationType === 'private' ? 'radio' : 'checkbox'}
                          name="userSelection"
                          id={`user-${user._id}`}
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => {}}
                          className="me-3"
                        />
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center">
                            <div className="user-avatar me-3">
                              {user.profile_picture ? (
                                <img 
                                  src={user.profile_picture} 
                                  alt={user.name}
                                  style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div 
                                  style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#007bff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <label htmlFor={`user-${user._id}`} className="mb-0 fw-bold">
                                {user.name}
                              </label>
                              <br />
                              <small className={selectedUsers.includes(user._id) ? 'text-white-50' : 'text-muted'}>
                                {user.current_career_plan || 'Non spécifié'}
                              </small>
                              <br />
                              <small className={selectedUsers.includes(user._id) ? 'text-white-50' : 'text-muted'}>
                                {user.email_address}
                              </small>
                            </div>
                          </div>
                        </div>
                        {user.isOnline && (
                          <Badge bg="success" pill className="ms-2">
                            En ligne
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowNewChatModal(false);
              setSelectedUsers([]);
              setGroupName('');
              setError('');
              setModalSearchTerm('');
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateConversation}
            disabled={loading || (conversationType === 'private' && selectedUsers.length !== 1) || (conversationType === 'group' && (selectedUsers.length === 0 || !groupName.trim()))}
          >
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatSidebar;