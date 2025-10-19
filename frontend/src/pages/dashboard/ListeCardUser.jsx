import React from 'react';
import './ListeCardUsers.css'; // Style optionnel

const ListeCardUsers = ({ users }) => {
  // Vérification de sécurité
  if (!users || users.length === 0) {
    return (
      <div className="no-users">
        <p>Aucun utilisateur à afficher</p>
      </div>
    );
  }

  return (
    <div className="liste-cards-container">
      <h3>👥 Utilisateurs enregistrés ({users.length})</h3>
      
      <div className="cards-grid">
        {users.map((user) => (
          <div key={user._id || user.id} className="user-card">
            {/* Header de la carte */}
            <div className="card-header">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <h4 className="user-name">
                  {user.name || 'Nom non renseigné'}
                </h4>
                <p className="user-email">{user.email}</p>
              </div>
            </div>

            {/* Body de la carte */}
            <div className="card-body">
              <div className="user-details">
                <div className="detail-item">
                  <span className="label">Rôle:</span>
                  <span className={`value role ${user.role}`}>
                    {user.role || 'user'}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="label">Statut:</span>
                  <span className={`value status ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {user.phone && (
                  <div className="detail-item">
                    <span className="label">Téléphone:</span>
                    <span className="value">{user.phone}</span>
                  </div>
                )}

                {user.createdAt && (
                  <div className="detail-item">
                    <span className="label">Inscrit le:</span>
                    <span className="value">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer de la carte */}
            <div className="card-footer">
              <button className="btn btn-primary">
                Voir profil
              </button>
              <button className="btn btn-secondary">
                Modifier
              </button>
              <button className="btn btn-danger">
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListeCardUsers;

//nooooooooooooooooooooooooooo