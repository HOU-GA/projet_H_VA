// components/chat/FilePicker.js
import React, { useState, useRef } from 'react';
import { 
  Card, 
  Button, 
  Row, 
  Col,
  Tab,
  Tabs,
  Form,
  Alert
} from 'react-bootstrap';

const FilePicker = ({ onFilesSelect, onClose, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fileCategories = {
    gallery: {
      name: 'Galerie',
      icon: '🖼️',
      accept: 'image/*',
      multiple: true
    },
    camera: {
      name: 'Caméra',
      icon: '📷',
      accept: 'image/*',
      multiple: false
    },
    audio: {
      name: 'Audio',
      icon: '🎵',
      accept: 'audio/*',
      multiple: true
    },
    video: {
      name: 'Vidéo',
      icon: '🎥',
      accept: 'video/*',
      multiple: true
    },
    document: {
      name: 'Documents',
      icon: '📄',
      accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx',
      multiple: true
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const triggerFileInput = (category) => {
    const input = fileInputRef.current;
    if (input) {
      input.accept = fileCategories[category].accept;
      input.multiple = fileCategories[category].multiple;
      input.click();
    }
  };

  const handleSendFiles = () => {
    if (selectedFiles.length > 0) {
      onFilesSelect(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-0">
      <Card.Header className="d-flex justify-content-between align-items-center py-2 bg-white border-bottom">
        <h6 className="mb-0 fs-6">Partager des fichiers</h6>
        <Button variant="link" onClick={onClose} className="p-0 text-dark fs-5">
          ✕
        </Button>
      </Card.Header>
      
      <Card.Body className="p-0">
        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="px-2 pt-2"
          fill
        >
          {Object.entries(fileCategories).map(([key, category]) => (
            <Tab 
              key={key}
              eventKey={key}
              title={
                <div className="text-center">
                  <div style={{ fontSize: '1.2rem' }}>{category.icon}</div>
                  <small>{isMobile ? '' : category.name}</small>
                </div>
              }
            >
              <div className="p-3 text-center">
                <div className="mb-3">
                  <h6>Partager {category.name.toLowerCase()}</h6>
                  <p className="text-muted small">
                    Sélectionnez des fichiers depuis votre appareil
                  </p>
                </div>
                
                <Button
                  variant="primary"
                  size={isMobile ? "sm" : undefined}
                  onClick={() => triggerFileInput(key)}
                  className="mb-3"
                >
                  📁 Parcourir les fichiers
                </Button>

                {/* Aperçu des fichiers sélectionnés */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <h6>Fichiers sélectionnés ({selectedFiles.length})</h6>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded mb-1">
                        <div className="d-flex align-items-center">
                          <span className="me-2">
                            {file.type.startsWith('image/') ? '🖼️' :
                             file.type.startsWith('audio/') ? '🎵' :
                             file.type.startsWith('video/') ? '🎥' : '📄'}
                          </span>
                          <small className="text-truncate" style={{ maxWidth: '150px' }}>
                            {file.name}
                          </small>
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      variant="success"
                      size="sm"
                      onClick={handleSendFiles}
                      className="mt-2"
                    >
                      📤 Envoyer {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            </Tab>
          ))}
        </Tabs>

        {/* Input file caché */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </Card.Body>
    </Card>
  );
};

export default FilePicker;