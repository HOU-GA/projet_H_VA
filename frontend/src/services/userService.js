import axios from 'axios';

const API_URL = 'http://localhost:9843/api';

const userService = {
  // Récupérer les utilisateurs pour le chat
  getUsersForChat: () => {
    return axios.get(`${API_URL}/user/chat/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};

export default userService;