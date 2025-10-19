import React from 'react'
import { Container } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-modern text-white">
      <Container className="text-center footer-content">
        <span className="footer-text">
          © 2025 <span className="brand-name">Minerva Link</span>. Tous droits réservés.
        </span>
      </Container>
    </footer>
  )
}

export default Footer