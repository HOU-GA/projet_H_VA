import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers, deleteUser } from '../../JS/actions/AdminAction';
import './DashboardUsers.css'; // Créer ce fichier CSS

const DashboardUsers = () => {
  const dispatch = useDispatch();
  const { users = [], isLoadUser } = useSelector(state => state.adminReducer);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      dispatch(deleteUser(userId));
    }
  };

  if (isLoadUser) {
    return (
      <div className="loading-container">
        <div className="loading">Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-users">
      <div className="dashboard-header">
        <h1>Gestion des Utilisateurs</h1>
        <div className="users-stats">
          <span className="stats-badge">{users.length} utilisateur(s)</span>
        </div>
      </div>

      <div className="users-grid">
        {users.length > 0 ? (
          users.map(user => (
            <div key={user._id} className="user-card">
              <div className="card-header">
                <h3 className="user-name">{user.name || 'Nom non disponible'}</h3>
                <span className={`role-badge ${user.role}`}>
                  {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
              
              <div className="card-body">
                <div className="user-info">
                  <p className="info-item">
                    <strong>📧 Email:</strong> 
                    <span>{user.email_address || 'Non disponible'}</span>
                  </p>
                  
                  <p className="info-item">
                    <strong>🎯 Grade:</strong> 
                    <span>{user.grade || 'Non spécifié'}</span>
                  </p>
                  
                  {user.phone_numbers?.[0]?.number && (
                    <p className="info-item">
                      <strong>📞 Téléphone:</strong> 
                      <span>{user.phone_numbers[0].number}</span>
                    </p>
                  )}
                  
                  {user.date_of_birth && (
                    <p className="info-item">
                      <strong>🎂 Date de naissance:</strong> 
                      <span>{new Date(user.date_of_birth).toLocaleDateString()}</span>
                    </p>
                  )}
                  
                  {user.gender && (
                    <p className="info-item">
                      <strong>⚧ Genre:</strong> 
                      <span>{user.gender}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button 
                  onClick={() => handleDeleteUser(user._id, user.name)}
                  className={`delete-btn ${user.role === 'admin' ? 'disabled' : ''}`}
                  disabled={user.role === 'admin'}
                  title={user.role === 'admin' ? 'Impossible de supprimer un administrateur' : 'Supprimer cet utilisateur'}
                >
                  {user.role === 'admin' ? '🔒 Admin protégé' : '🗑️ Supprimer'}
                </button>
                
                <button 
                  className="edit-btn"
                  title="Modifier l'utilisateur"
                >
                  ✏️ Modifier
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-users">
            <p>📭 Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardUsers;