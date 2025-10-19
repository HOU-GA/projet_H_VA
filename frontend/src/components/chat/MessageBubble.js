// components/chat/MessageBubble.js   
import React, { useState } from 'react';
import { Card, Badge, Alert, Button, Modal, Spinner } from 'react-bootstrap';

const MessageBubble = ({ 
  message, 
  isOwn, 
  isSending, 
  hasError,
  formatFileSize,
  getFileIconProp, // Renommé pour éviter le conflit
  isMobile = false
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Fonction interne pour obtenir l'icône du fichier
  const getFileIconInternal = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.startsWith('video/')) return '🎥';
    if (fileType?.startsWith('audio/')) return '🎵';
    if (fileType === 'application/pdf') return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('sheet') || fileType?.includes('excel')) return '📊';
    return '📎';
  };

  // Utiliser la prop ou la fonction interne
  const getFileIconToUse = getFileIconProp || getFileIconInternal;

  // Fonction interne pour formater la taille
  const formatSizeInternal = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Utiliser la prop ou la fonction interne
  const formatFileSizeToUse = formatFileSize || formatSizeInternal;

  // Vérifier si un fichier est une image
  const isImageFile = (file) => {
    return file.type?.startsWith('image/') || 
           file.url?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) ||
           file.filename?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  };

  // Vérifier si un fichier est une vidéo
  const isVideoFile = (file) => {
    return file.type?.startsWith('video/') || 
           file.url?.match(/\.(mp4|mov|avi|mkv|webm)$/i) ||
           file.filename?.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  };

  // Vérifier si un fichier est un audio
  const isAudioFile = (file) => {
    return file.type?.startsWith('audio/') || 
           file.url?.match(/\.(mp3|wav|m4a|ogg|flac)$/i) ||
           file.filename?.match(/\.(mp3|wav|m4a|ogg|flac)$/i);
  };

  // Ouvrir l'image en modal
  const handleImageClick = (file) => {
    if (isImageFile(file)) {
      setSelectedImage(file.url || file.uri);
      setShowImageModal(true);
      setImageLoading(true);
    }
  };

  // Télécharger un fichier
  const handleDownload = (file) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name || file.filename || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderFilePreview = (file, index) => {
    const isImg = isImageFile(file);
    const isVid = isVideoFile(file);
    const isAud = isAudioFile(file);
    const fileUrl = file.url || file.uri;

    return (
      <Card 
        key={index} 
        className="mb-2 border-0 bg-light file-preview-card"
      >
        <Card.Body className="p-2">
          <div className="d-flex align-items-center">
            {/* Icône ou prévisualisation */}
            <div className="flex-shrink-0 me-2 me-md-3">
              {isImg ? (
                <div 
                  className="image-preview-container"
                  style={{ 
                    width: isMobile ? '50px' : '60px', 
                    height: isMobile ? '50px' : '60px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => handleImageClick(file)}
                >
                  {imageLoading && (
                    <div className="d-flex justify-content-center align-items-center h-100">
                      <Spinner animation="border" size="sm" />
                    </div>
                  )}
                  <img
                    src={fileUrl}
                    alt={file.name || 'Image'}
                    className="rounded"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: imageLoading ? 'none' : 'block'
                    }}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                </div>
              ) : (
                <div 
                  className="d-flex justify-content-center align-items-center rounded bg-white border"
                  style={{ 
                    width: isMobile ? '50px' : '60px', 
                    height: isMobile ? '50px' : '60px' 
                  }}
                >
                  <span className="fs-4">
                    {getFileIconToUse(file.type)}
                  </span>
                </div>
              )}
            </div>

            {/* Informations du fichier */}
            <div className="flex-grow-1 min-width-0">
              <div className="fw-bold small text-truncate mb-1">
                {file.name || file.filename || `Fichier ${index + 1}`}
              </div>
              
              {file.size && (
                <small className="text-muted d-block mb-1">
                  {formatFileSizeToUse(file.size)}
                </small>
              )}

              {/* Actions */}
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="py-0 px-2"
                >
                  <small>Télécharger</small>
                </Button>
                
                {isImg && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleImageClick(file)}
                    className="py-0 px-2"
                  >
                    <small>Voir</small>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Lecteur audio/vidéo intégré */}
          {isVid && fileUrl && (
            <div className="mt-2">
              <video 
                controls 
                style={{ maxWidth: '100%', maxHeight: '200px' }}
                preload="metadata"
              >
                <source src={fileUrl} type={file.type || 'video/mp4'} />
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          )}

          {isAud && fileUrl && (
            <div className="mt-2">
              <audio controls style={{ width: '100%' }} preload="metadata">
                <source src={fileUrl} type={file.type || 'audio/mpeg'} />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) {
      return null;
    }

    return (
      <div className="mt-2">
        {message.attachments.map((file, index) => renderFilePreview(file, index))}
      </div>
    );
  };

  const getMessageTime = () => {
    if (!message.created_at) return '';
    const date = new Date(message.created_at);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageDate = () => {
    if (!message.created_at) return '';
    const date = new Date(message.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  return (
    <>
      <div className={`d-flex mb-3 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}>
        <div 
          className={`message-bubble p-2 p-md-3 rounded ${
            isOwn 
              ? 'bg-primary text-white' 
              : 'bg-light text-dark'
          } ${isSending ? 'opacity-75' : ''} ${hasError ? 'border border-danger' : ''}`}
          style={{ 
            maxWidth: isMobile ? '85%' : '70%',
            minWidth: isMobile ? 'auto' : '120px'
          }}
        >
          {/* Date séparateur (optionnel) */}
          {message.showDate && (
            <div className="text-center mb-2">
              <Badge bg="secondary" className="fw-normal">
                {getMessageDate()}
              </Badge>
            </div>
          )}

          {/* Statut d'envoi */}
          {isSending && (
            <Badge bg="secondary" className="mb-1">
              <Spinner animation="border" size="sm" className="me-1" />
              Envoi...
            </Badge>
          )}
          
          {hasError && (
            <Alert variant="danger" className="py-1 mb-2 small">
              <strong>Erreur d'envoi</strong>
              <div className="mt-1">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => {/* Fonction de réessai */}}
                >
                  Réessayer
                </Button>
              </div>
            </Alert>
          )}

          {/* Contenu du message */}
          {message.message_text && (
            <div 
              className="message-text"
              style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.message_text}
            </div>
          )}

          {/* Fichiers joints */}
          {renderAttachments()}

          {/* Timestamp et statut */}
          <div className={`message-time d-flex justify-content-between align-items-center mt-1 ${
            isOwn ? 'text-white-50' : 'text-muted'
          }`}>
            <small>{getMessageTime()}</small>
            {isOwn && (
              <small className="ms-2">
                {message.message_status === 'read' && '✓✓'}
                {message.message_status === 'sent' && '✓'}
                {message.message_status === 'sending' && '⏳'}
                {message.message_status === 'error' && '❌'}
              </small>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour l'image plein écran */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)}
        centered
        size="lg"
        fullscreen="md-down"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-center align-items-center p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Aperçu"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="primary"
            onClick={() => {
              const link = document.createElement('a');
              link.href = selectedImage;
              link.download = 'image';
              link.click();
            }}
          >
            Télécharger
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MessageBubble; 

