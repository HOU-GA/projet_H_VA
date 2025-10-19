//components/userCard/UserCard.jsx
import React from 'react'
import { Button, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { deleteUser } from '../../JS/actions/AdminAction'
import './UserCard.css'

const UserCard = ({user}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const currentUser = useSelector(state => state.authReducer.user)
  
  const isAdminUser = (user) => {
    return user && user.role === 'admin';
  };

  const isCurrentUserAdmin = currentUser?.role === 'admin'

  const handleDetails = () => {
    if (isCurrentUserAdmin) {
      navigate(`/admin/profile/${user._id}`)
    } else {
      navigate('/profile')
    }
  }

  const handleSupp = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      dispatch(deleteUser(user._id))
    }
  }

  return (
    <div className="user-card-container">
      <Card className="user-card">
        {/* Conteneur d'image professionnel */}
        <div className="user-card-img-container">
          {user.profile_picture ? (
            <>
              <img 
                src={user.profile_picture} 
                alt={user.name}
                className="user-card-img"
              />
              <div className="user-card-img-overlay"></div>
            </>
          ) : (
            <div className="default-avatar">
              👤
            </div>
          )}
          
          {/* Badge de rôle */}
          <div className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
          </div>
          
          {/* Statut en ligne */}
          {user.isAuth && <div className="online-status" title="En ligne"></div>}
        </div>

        <Card.Body>
          <Card.Title>{user.name}</Card.Title>
          <Card.Text>
            {user.current_career_plan}
          </Card.Text>
          
          {/* Boutons d'action */}
          <div className="user-card-actions">
            <Button 
              className="btn-details"
              onClick={handleDetails}
            >
              {isCurrentUserAdmin ? '👁️ Voir Profil' : '📋 Détails'}
            </Button>
            
            {isCurrentUserAdmin && !isAdminUser(user) && (
              <Button 
                className="btn-delete"
                onClick={handleSupp}
              >
                🗑️ Supprimer
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}

export default UserCard