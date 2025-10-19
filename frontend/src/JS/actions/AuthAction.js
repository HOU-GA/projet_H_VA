import { FAIL_USER, LOAD_USER } from "../actionTypes/AdminActionType";
import { CURRENT_AUTH, EDIT_USER, FAIL_AUTH, LOAD_Auth, LOGOUT_AUTH, SUCCESS_Auth } from "../actionTypes/AuthActionType"
import axios from 'axios'

//action pour connecter un utilisateur deja enregistrer
export const login = (user, navigate) => async (dispatch) => {
    dispatch({type: LOAD_Auth});
    try {
        console.log('🟢 ACTION LOGIN: Démarrage avec:', user.email_address);
        const result = await axios.post("/api/user/login", user);
        console.log('✅ ACTION LOGIN: Réponse serveur:', result.data);
        
        // Stocker le token
        if (result.data.token) {
            localStorage.setItem("token", result.data.token);
            console.log('🔐 Token stocké:', result.data.token);
        }
        
        // Dispatcher les données
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                user: result.data.user,
                token: result.data.token,
                isAuth: true
            }
        });
        
        // ✅ REDIRECTION APRÈS SUCCÈS
        console.log('🔄 Redirection vers Home...');
        if (navigate) {
            navigate('/');
        }
        
    } catch (error) {
        console.error('❌ ACTION LOGIN: Erreur', error.response?.data);
        dispatch({
            type: FAIL_AUTH, 
            payload: error.response?.data?.errors || [{ msg: 'Erreur de connexion au serveur' }]
        });
    }
}

//action pour enregistrer un nouveau utilisateur
export const register = (newUser, navigate) => async (dispatch) => {
    dispatch({type:LOAD_Auth})
    try {
        const result = await axios.post("/api/user/register", newUser);
        dispatch({type: SUCCESS_Auth, payload: result.data})
        
        // ✅ Redirection après inscription réussie
        if (navigate) {
            navigate('/profile');
        }
    } catch (error) {
        dispatch({type: FAIL_AUTH, payload: error.response.data.errors})
    }
}

//action pour verifier qui est connecter
export const current = () => async (dispatch) => {
    dispatch({type: LOAD_Auth});
    try {
        let config = {
            headers: {
                authorization: localStorage.getItem("token")
            }  
        }
        const result = await axios.get('/api/user/current', config)
        dispatch({type: CURRENT_AUTH, payload: result.data})
    } catch (error) {
        dispatch({type: FAIL_AUTH, payload: error.response.data.errors})
    }
}

//quand le user se deconnecte: remove token
export const logout = (navigate) => (dispatch) => {
    dispatch({type: LOGOUT_AUTH})
    if (navigate) {
        navigate('/login')
    }
}

export const updateUserProfile = (userId, userData) => async (dispatch) => {
    dispatch({type: LOAD_USER});
    try {
        
        let config = {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        };
        const result = await axios.put(`/api/user/update/${userId}`, userData, config)
        dispatch({type: EDIT_USER, payload: result.data})
        
    } catch (error) {
        dispatch({type: FAIL_USER, payload: error.response.data});
    }
};
