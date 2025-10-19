
import React from 'react'
import UserCard from '../userCard/UserCard'
import { useSelector } from 'react-redux'
import '../listeCardUser/ListeCardUser.css'

const ListeCardUsers = () => {
  const users = useSelector((state) => state.adminReducer.users);
  
  return (
    <div className="liste-users-container">
      {users.map((user) => (
        <UserCard key={user._id} user={user}/>
      ))}
    </div>
  )
}

export default ListeCardUsers