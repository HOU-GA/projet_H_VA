// src/pages/users/UsersList.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../JS/actions/AdminAction';

const UsersList = () => {
  const dispatch = useDispatch();
  const { users = [], isLoadUser } = useSelector(state => state.adminReducer);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  if (isLoadUser) {
    return <div>Chargement des utilisateurs...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Liste des Utilisateurs</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {users.length > 0 ? (
          users.map(user => (
            <div key={user._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
              <h3>{user.name}</h3>
              <p><strong>Email:</strong> {user.email_address}</p>
              <p><strong>Rôle:</strong> {user.role}</p>
              <p><strong>Grade:</strong> {user.grade}</p>
              {user.phone_numbers?.[0]?.number && (
                <p><strong>Téléphone:</strong> {user.phone_numbers[0].number}</p>
              )}
            </div>
          ))
        ) : (
          <p>Aucun utilisateur trouvé</p>
        )}
      </div>
    </div>
  );
};

export default UsersList;