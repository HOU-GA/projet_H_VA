import React from 'react';
import './Logo.css';
// Importez votre image animée
import logoAnimated from '../logo/robo.gif';

const Logo = () => {
  return (
    <div className="logo-image-container">
      <img 
        src={logoAnimated} 
        alt="Minerva Link Logo" 
        className="logo-animated"
      />
      
    </div>
  );
};

export default Logo;