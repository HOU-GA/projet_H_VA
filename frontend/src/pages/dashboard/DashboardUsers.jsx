

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '../../JS/actions/AdminAction';
import ListeCardUsers from '../../components/listeCardUser/ListeCardUsers';

const DashboardUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.adminReducer.users);
  
  // États pour gérer le chargement et les erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Début du chargement des utilisateurs...');
        await dispatch(getUsers());
      } catch (err) {
        setError("Erreur lors du chargement des utilisateurs");
        console.error("Erreur dispatch:", err);
      } finally {
        setLoading(false);
        console.log('Chargement terminé');
      }
    };
    
    fetchUsers();
  }, [dispatch]);

  // Logs détaillés pour le débogage
  console.log('=== DEBUG DashboardUsers ===');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Users:', users);
  console.log('Users type:', typeof users);
  console.log('Is array?:', Array.isArray(users));
  console.log('Users length:', users?.length || 0);
  console.log('============================');

  // États d'affichage
  if (loading) {
    return (
      <div className="loading-container">
        <p>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Erreur: {error}</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="empty-container">
        <p>Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Liste des utilisateurs ({users.length})</h2>
      
          {/* Affichez les données utilisateur */}
          <ListeCardUsers/>
        </div>
      )
      
}

export default DashboardUsers;
