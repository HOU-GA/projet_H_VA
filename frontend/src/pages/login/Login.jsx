import React, { useState } from 'react'
import { Button, Form, Container, Row, Col, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../../JS/actions/AuthAction'
import './Login.css'

const Login = () => {
  const [user, setUser] = useState({
    email_address: '',
    password: '',
  });
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');
  const [rememberMe, setRememberMe] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  }

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  }

  // Fonction pour valider l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setShowAlert(false);

    // Validation des champs
    if (!user.email_address || !user.password) {
      setAlertMessage('يرجى ملء جميع الحقول المطلوبة');
      setAlertVariant('danger');
      setShowAlert(true);
      return;
    }

    // Validation de l'email
    if (!validateEmail(user.email_address)) {
      setAlertMessage('البريد الإلكتروني غير صحيح');
      setAlertVariant('danger');
      setShowAlert(true);
      return;
    }

    // ✅ Dispatch avec navigation
    dispatch(login(user, navigate));
  }

  return (
    <Container fluid className="login-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col xs={12} sm={10} md={8} lg={6} xl={4} xxl={3}>
          <Card className="login-card">
            <Card.Header className="login-header">
              <h2 className="login-title">Minerva Link</h2>
              <p className="login-subtitle">تسجيل الدخول</p>
            </Card.Header>
            
            <Card.Body className="login-body">
              {/* Alert pour les messages */}
              {showAlert && (
                <Alert 
                  variant={alertVariant} 
                  dismissible 
                  onClose={() => setShowAlert(false)}
                  className="login-alert"
                >
                  {alertMessage}
                </Alert>
              )}

              <Form className="login-form" onSubmit={handleLogin}>
                {/* Section Email */}
                <div className="form-section">
                  <Form.Group className="mb-4 form-group-custom">
                    <Form.Label className="form-label">
                      البريد الالكتروني *
                    </Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email_address"
                      placeholder="أدخل بريدك الالكتروني" 
                      className="form-input"
                      value={user.email_address}
                      onChange={handleChange}
                      dir="rtl"
                      required 
                    />
                  </Form.Group>
                </div>

                {/* Section Mot de passe */}
                <div className="form-section">
                  <Form.Group className="mb-4 form-group-custom">
                    <Form.Label className="form-label">
                      الرقم السري *
                    </Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password"
                      placeholder="أدخل رقمك السري" 
                      className="form-input"
                      value={user.password}
                      onChange={handleChange}
                      dir="rtl"
                      required 
                    />
                  </Form.Group>
                </div>

                {/* Options supplémentaires */}
                <div className="login-options mb-4">
                  <Form.Check
                    type="checkbox"
                    id="remember-me"
                    label="تذكرني"
                    className="remember-check"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    dir="rtl"
                  />
                  <Link to="/forgot-password" className="forgot-password-link">
                    نسيت كلمة المرور؟
                  </Link>
                </div>

                {/* Bouton de connexion */}
                <div className="form-actions">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="login-btn w-100"
                  >
                    تسجيل الدخول
                  </Button>
                </div>

                {/* Lien vers l'inscription */}
                <div className="register-link-section text-center mt-4">
                  <p className="register-text">
                    ليس لديك حساب؟{' '}
                    <Link to="/register" className="register-link">
                      سجل حساب جديد
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Login