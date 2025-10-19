// components/chat/FilePreview.js
import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';

const FilePreview = ({ files, onRemove, formatFileSize, getFileIcon, isMobile }) => {
  // ✅ CORRECTION: Fonction pour obtenir l'URL sécurisée
  const getFileUrl = (file) => {
    if (file.preview) return file.preview;
    if (file.localUrl) return file.localUrl;
    if (file.url) return file.url;
    return null;
  };

  return (
    <div className="file-preview">
      <small className="text-muted mb-2 d-block">
        Fichiers à envoyer ({files.length})
      </small>
      
      <Row className="g-2">
        {files.map((file, index) => {
          const fileUrl = getFileUrl(file);
          const fileName = file.name || 'Fichier sans nom';
          
          return (
            <Col key={index} xs={12} sm={6} md={4}>
              <Card className="file-preview-item h-100">
                <Card.Body className="p-2">
                  {/* Aperçu image */}
                  {file.type?.startsWith('image/') && fileUrl && (
                    <div className="text-center mb-2">
                      <img
                        src={fileUrl}
                        alt={fileName}
                        style={{
                          maxHeight: '80px',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                        className="rounded"
                      />
                    </div>
                  )}
                  
                  {/* Icône et informations */}
                  <div className="d-flex align-items-center">
                    <span className="me-2 fs-5">
                      {getFileIcon(file)}
                    </span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div 
                        className="fw-bold text-truncate small"
                        title={fileName}
                      >
                        {fileName}
                      </div>
                      <small className="text-muted">
                        {formatFileSize?.(file.size) || 'Taille inconnue'}
                      </small>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onRemove(index)}
                      className="ms-2"
                    >
                      ✕
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default FilePreview;