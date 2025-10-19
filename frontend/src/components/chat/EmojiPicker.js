// components/chat/EmojiPicker.js
import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col,
  Container
} from 'react-bootstrap';

const EmojiPicker = ({ onEmojiSelect, onClose, isMobile = false }) => {
  const [selectedCategory, setSelectedCategory] = useState('smileys');

  const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝'],
    animals: ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷'],
    objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️'],
    flags: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹', '🇦🇿', '🇧🇸', '🇧🇭', '🇧🇩', '🇧🇧', '🇧🇾', '🇧🇪', '🇧🇿']
  };

  const categories = [
    { id: 'smileys', icon: '😀', name: 'Smileys' },
    { id: 'people', icon: '👋', name: 'Personnes' },
    { id: 'animals', icon: '🐵', name: 'Animaux' },
    { id: 'food', icon: '🍎', name: 'Nourriture' },
    { id: 'activities', icon: '⚽', name: 'Activités' },
    { id: 'objects', icon: '📱', name: 'Objets' },
    { id: 'symbols', icon: '❤️', name: 'Symboles' },
    { id: 'flags', icon: '🏳️', name: 'Drapeaux' }
  ];

  return (
    <Card className="border-0">
      <Card.Header className="d-flex justify-content-between align-items-center py-2 bg-white border-bottom">
        <h6 className="mb-0 fs-6">Émojis</h6>
        <Button variant="link" onClick={onClose} className="p-0 text-dark fs-5">
          ✕
        </Button>
      </Card.Header>
      
      <Card.Body className="p-2">
        {/* Catégories - Scroll horizontal sur mobile */}
        <div className={`d-flex mb-3 ${isMobile ? 'overflow-auto' : 'flex-wrap'} gap-1`}>
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "primary" : "outline-secondary"}
              size="sm"
              className={`d-flex align-items-center ${isMobile ? 'flex-shrink-0' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="me-1">{category.icon}</span>
              {!isMobile && <span>{category.name}</span>}
            </Button>
          ))}
        </div>

        {/* Grille d'émojis responsive */}
        <Row className={`g-1 ${isMobile ? 'row-cols-6' : 'row-cols-8'}`}>
          {emojiCategories[selectedCategory]?.map((emoji, index) => (
            <Col key={index}>
              <Button
                variant="outline-light"
                className="w-100 border-0 p-2"
                onClick={() => onEmojiSelect(emoji)}
                style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}
              >
                {emoji}
              </Button>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default EmojiPicker;