//components/barrenav/BarreNav.js

import React, { useState, useEffect } from 'react'
import { Container, Nav, Navbar, Badge } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../logo/Logo'
import './BarreNav.css'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../JS/actions/AuthAction'
import { useChat } from '../../context/ChatContext'
import { getUnreadCount, getNotifications, getUnviewedActivitiesCount } from '../../JS/actions/NotificationActivityAction'

const BarreNav = () => {
  const dispatch = useDispatch()
  const [activeItem, setActiveItem] = useState('/')
  const location = useLocation()

  useEffect(() => {
    setActiveItem(location.pathname)
  }, [location.pathname])

  const navigate = useNavigate()
  const isAuth = useSelector((state) => state.authReducer.isAuth)
  const user = useSelector((state) => state.authReducer.user)
  
  // Notifications
  const { notifications: chatNotifications, loadNotifications } = useChat()
  const activityUnviewedCount = useSelector(state => state.notificationActivityReducer?.unviewedCount || 0)
  const unreadChatCount = chatNotifications.filter(notif => !notif.is_read).length

  // ✅ CHARGEMENT INITIAL DES NOTIFICATIONS
  useEffect(() => {
    if (isAuth) {
      console.log('🔄 Chargement des notifications activités...');
      loadNotifications()
      
      const loadActivityNotifications = async () => {
        try {
          await dispatch(getUnviewedActivitiesCount())
          await dispatch(getNotifications(1, 5))
        } catch (error) {
          console.log('⚠️ Notifications activités non disponibles')
        }
      }
      
      loadActivityNotifications()
    }
  }, [isAuth, loadNotifications, dispatch])

  // ✅ POLLING DYNAMIQUE : Actualiser toutes les 15 secondes
  useEffect(() => {
    if (isAuth) {
      console.log('🔄 Démarrage du polling des notifications...');
      
      const interval = setInterval(() => {
        dispatch(getUnviewedActivitiesCount())
          .then(result => {
            if (result?.unviewedCount > 0) {
              console.log(`🔔 ${result.unviewedCount} nouvelles activités non consultées`);
            }
          })
          .catch(error => {
            console.log('⚠️ Erreur polling notifications:', error);
          });
      }, 15000) // ✅ 15 secondes au lieu de 30
      
      return () => {
        console.log('🛑 Arrêt du polling des notifications');
        clearInterval(interval);
      }
    }
  }, [isAuth, dispatch])

  const isAdmin = user && user.role === 'admin'

  return (
    <div>
      <Navbar className="navbar-modern" data-bs-theme="dark" expand="lg">
        <Container>
          <Logo />
          <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
            Minerva Link
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className={`nav-link-custom ${activeItem === '/' ? 'active' : ''}`}>
                Home
              </Nav.Link>

              {/* ✅ ACTIVITÉS AVEC BADGE DYNAMIQUE */}
              {isAuth && (
                <Nav.Link 
                  as={Link} 
                  to="/activities" 
                  className={`nav-link-custom ${activeItem === '/activities' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveItem('/activities')
                    // ✅ Recharger le compteur quand on clique sur le lien
                    setTimeout(() => {
                      dispatch(getUnviewedActivitiesCount());
                    }, 1000);
                  }}
                >
                  📝 الأنشطة
                  {/* ✅ BADGE DYNAMIQUE ACTIVITÉS NON CONSULTÉES - COMMENCE À 0 */}
                  {activityUnviewedCount > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="ms-1 notification-badge pulse"
                      style={{ 
                        fontSize: '0.7rem',
                        animation: 'pulse 1.5s infinite'
                      }}
                      title={`${activityUnviewedCount} nouvelle(s) activité(s)`}
                    >
                      {activityUnviewedCount > 99 ? '99+' : activityUnviewedCount}
                    </Badge>
                  )}
                </Nav.Link>
              )}

              {/* ✅ MESSAGES AVEC BADGE - COMMENCE À 0 */}
              {isAuth && (
                <Nav.Link 
                  as={Link} 
                  to="/chat" 
                  className={`nav-link-custom ${activeItem === '/chat' ? 'active' : ''}`}
                >
                  💬 Messages
                  {/* ✅ BADGE MESSAGES NON LUS - COMMENCE À 0 */}
                  {unreadChatCount > 0 && (
                    <Badge 
                      bg="warning" 
                      pill 
                      className="ms-1 notification-badge"
                      style={{ 
                        fontSize: '0.7rem'
                      }}
                      title={`${unreadChatCount} message(s) non lu(s)`}
                    >
                      {unreadChatCount > 99 ? '99+' : unreadChatCount}
                    </Badge>
                  )}
                </Nav.Link>
              )}

              {isAdmin && (
                <Nav.Link 
                  as={Link} 
                  to="/admin"
                  className={`nav-link-custom ${activeItem.startsWith('/admin') ? 'active' : ''}`}
                  onClick={() => setActiveItem('/admin')}
                >
                  Dashboard
                </Nav.Link>
              )}
              
              {isAuth ? (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/profile" 
                    className={`nav-link-custom ${activeItem === '/profile' ? 'active' : ''}`}
                    onClick={() => setActiveItem('/profile')}
                  >
                    Profile
                  </Nav.Link>
                  <Nav.Link 
                    href="#" 
                    className="nav-link-custom"
                    onClick={() => dispatch(logout(navigate))}
                  >
                    LogOut
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link 
                    as={Link} 
                    to="/register" 
                    className={`nav-link-custom ${activeItem === '/register' ? 'active' : ''}`}
                    onClick={() => setActiveItem('/register')}
                  >
                    Register
                  </Nav.Link>
                  <Nav.Link 
                    as={Link} 
                    to="/login" 
                    className={`nav-link-custom ${activeItem === '/login' ? 'active' : ''}`}
                    onClick={() => setActiveItem('/login')}
                  >
                    Login
                  </Nav.Link>
                </>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default BarreNav