import React, { useState, useCallback } from 'react';
import './Avatar.css';

const Avatar = ({ 
  src, 
  alt, 
  className = '', 
  size = 'md',
  fallback = '/default-avatar.png'
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
    }
  }, [hasError, fallback]);

  return (
    <img
      src={hasError ? fallback : imgSrc}
      alt={alt}
      className={`avatar avatar-${size} ${className}`}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default React.memo(Avatar);