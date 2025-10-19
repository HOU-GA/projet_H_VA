
import { DELETE_USER, FAIL_USER, Get_All_USERS, LOAD_USER, GET_USER_SUCCESS, GET_USER_REQUEST, EDIT_USER_SUCCESS } from "../actionTypes/AdminActionType"
import axios from "axios"

// 🟢 GET USERS - CORRIGÉ AVEC RECHERCHE AUTOMATIQUE
export const getUsers = () => async (dispatch) => {
    console.log('🟢 ACTION: getUsers démarré');
    dispatch({type: LOAD_USER});
    
    try {
        const token = localStorage.getItem("token");
        console.log('🟢 ACTION: Token présent:', !!token);
        
        let config = {
            headers: {
                authorization: token,
            },
        };
        
        console.log('🟢 ACTION: Appel API /api/admin/all');
        const result = await axios.get("/api/admin/all", config);
        
        // 🎯 DEBUG COMPLET - EXPLORER TOUTE LA STRUCTURE
        console.log('=== DEBUG getUsers API Response ===');
        console.log('Status:', result.status);
        console.log('Data complète:', result.data);
        
        // 🔍 AFFICHER TOUTES LES CLÉS DISPONIBLES
        console.log('Clés dans data:', Object.keys(result.data));
        
        // 🔍 EXPLORER CHAQUE PROPRIÉTÉ
        for (let key in result.data) {
            console.log(`Propriété "${key}":`, result.data[key]);
            console.log(`Type de "${key}":`, typeof result.data[key]);
            if (Array.isArray(result.data[key])) {
                console.log(`✅ "${key}" est un tableau avec ${result.data[key].length} éléments`);
                if (result.data[key].length > 0) {
                    console.log(`📋 Premier élément de "${key}":`, result.data[key][0]);
                }
            }
        }
        
        // 🎯 AFFICHER LA STRUCTURE COMPLÈTE EN JSON
        console.log('Structure JSON complète:');
        console.log(JSON.stringify(result.data, null, 2));
        console.log('========================');
        
        // 🎯 TROUVER AUTOMATIQUEMENT LES DONNÉES UTILISATEURS
        let usersData = [];
        let foundKey = '';
        
        // Rechercher un tableau dans les données
        for (let key in result.data) {
            if (Array.isArray(result.data[key])) {
                usersData = result.data[key];
                foundKey = key;
                console.log(`✅ DONNÉES TROUVÉES: Utilisation de la propriété "${key}" avec ${usersData.length} éléments`);
                break;
            }
        }
        
        // Si pas de tableau trouvé, essayer result.data directement
        if (usersData.length === 0 && Array.isArray(result.data)) {
            usersData = result.data;
            foundKey = 'data direct';
            console.log(`✅ DONNÉES TROUVÉES: Utilisation directe de data avec ${usersData.length} éléments`);
        }
        
        if (usersData.length === 0) {
            console.warn('⚠️ AUCUN TABLEAU TROUVÉ dans la réponse API');
            console.log('Structure disponible:', Object.keys(result.data));
        }
        
        console.log(`🟢 Données utilisateurs (${foundKey}):`, usersData.length, 'utilisateurs');
        if (usersData.length > 0) {
            console.log('🟢 Premier utilisateur:', usersData[0]);
        }
        
        // Dispatcher les données trouvées (même si vide)
        dispatch({type: Get_All_USERS, payload: usersData});
        console.log(`🟢 ACTION: Get_All_USERS dispatché avec ${usersData.length} utilisateurs`);
        
    } catch (error) {
        console.error('❌ ACTION: Erreur getUsers:', error);
        
        console.log('=== DEBUG getUsers Error ===');
        console.log('Message:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data erreur:', error.response.data);
        } else if (error.request) {
            console.log('Aucune réponse reçue');
        }
        
        console.log('========================');
        
        const errorPayload = error.response?.data || { message: error.message };
        dispatch({type: FAIL_USER, payload: errorPayload});
    }
};

// 🟢 GET USER BY ID - VERSION CORRIGÉE (utilise les données existantes)
export const getUserById = (userId) => async (dispatch, getState) => {
    console.log('🟢 ACTION: getUserById démarré pour ID:', userId);
    dispatch({type: GET_USER_REQUEST});
    
    try {
        // ✅ CORRECTION : Récupérer l'état actuel pour utiliser les données déjà chargées
        const state = getState();
        const users = state.adminReducer.users;
        
        console.log('🟢 ACTION: Recherche dans', users.length, 'utilisateurs chargés');
        
        // Chercher l'utilisateur dans la liste existante
        const user = users.find(u => u._id === userId);
        
        if (!user) {
            console.warn('❌ ACTION: Utilisateur non trouvé dans la liste chargée');
            console.log('IDs disponibles:', users.map(u => u._id));
            
            // ✅ CORRECTION : Essayer avec différentes propriétés d'ID
            const userAlt = users.find(u => 
                u._id === userId || 
                u.id === userId || 
                u.userId === userId
            );
            
            if (userAlt) {
                console.log('✅ ACTION: Utilisateur trouvé avec ID alternatif');
                dispatch({type: GET_USER_SUCCESS, payload: userAlt});
                return Promise.resolve(userAlt);
            }
            
            throw new Error(`Utilisateur avec ID ${userId} non trouvé dans les données chargées`);
        }
        
        console.log('✅ ACTION: Utilisateur trouvé:', user.name);
        
        // Dispatcher les données utilisateur
        dispatch({type: GET_USER_SUCCESS, payload: user});
        console.log('🟢 ACTION: GET_USER_SUCCESS dispatché');
        
        return Promise.resolve(user);
        
    } catch (error) {
        console.error('❌ ACTION: Erreur getUserById:', error);
        
        console.log('=== DEBUG getUserById Error ===');
        console.log('Message:', error.message);
        
        // ✅ CORRECTION : Message d'erreur plus informatif
        const errorPayload = { 
            message: error.message,
            note: 'Les données sont récupérées depuis la liste déjà chargée. Assurez-vous que getUsers() a été appelé au préalable.'
        };
        
        dispatch({type: FAIL_USER, payload: errorPayload});
        return Promise.reject(error);
    }
};

// 🟢 DELETE USER - CORRIGÉ AVEC GESTION D'ERREUR COMPLÈTE
export const deleteUser = (id) => async(dispatch) => {
    console.log('🟢 ACTION: deleteUser pour ID:', id);
    dispatch({type: LOAD_USER});
    
    try {
        const token = localStorage.getItem("token");
        console.log('🟢 ACTION: Token présent:', !!token);
        
        let config = {
            headers: {
                authorization: token,
            },
        };
        
        console.log('🟢 ACTION: Appel DELETE /api/admin/' + id);
        const result = await axios.delete(`/api/admin/${id}`, config);
        
        console.log('=== DEBUG deleteUser Response ===');
        console.log('Status:', result.status);
        console.log('Data:', result.data);
        console.log('userToDel:', result.data.userToDel);
        console.log('========================');
        
        dispatch({type: DELETE_USER, payload: result.data.userToDel});
        console.log('🟢 ACTION: DELETE_USER dispatché');
        dispatch(getUsers());
    } catch (error) {
        console.error('❌ ACTION: Erreur deleteUser:', error);
        
        console.log('=== DEBUG deleteUser Error ===');
        console.log('Message:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
        console.log('========================');
        
        dispatch({type: FAIL_USER, payload: error.response?.data || error.message});
    }
};

// 🟢 UPDATE USER PROFILE (POUR ADMIN - modification de tous les profils)
/*export const updateUserProfile = (userId, userData) => async (dispatch) => {
    console.log('🟢 ADMIN ACTION: updateUserProfile pour ID:', userId);
    dispatch({type: LOAD_USER});
    
    try {
        const token = localStorage.getItem("token");
        console.log('🟢 Token admin présent:', !!token);
        
        let config = {
            headers: {
                Authorization: token,
                'Content-Type': 'application/json'
            },
        };
        
        // ✅ CORRECTION : Utiliser la route admin pour la modification par admin
        const result = await axios.put(
            `http://localhost:9843/api/admin/update/${userId}`, 
            userData, 
            config
        );
        
        console.log('✅ ADMIN ACTION: Réponse updateUserProfile:', result.data);
        
        // ✅ Dispatcher EDIT_USER_SUCCESS pour admin
        dispatch({type: EDIT_USER_SUCCESS, payload: result.data});
        
        // ✅ Recharger la liste des utilisateurs
        dispatch(getUsers());
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ADMIN ACTION: Erreur updateUserProfile:', error);
        
        const errorPayload = error.response?.data || { 
            msg: error.message || 'Erreur lors de la mise à jour' 
        };
        
        dispatch({type: FAIL_USER, payload: errorPayload});
        throw error;
    }
};*/


export const updateUserProfile = (userId, userData) => async (dispatch) => {
    dispatch({type: LOAD_USER});
    try {
        
        let config = {
            headers: {
                Authorization: localStorage.getItem("token"),
            },
        };
        const result = await axios.put(`/api/user/update/${userId}`, userData, config)
        dispatch({type: EDIT_USER_SUCCESS, payload: result.data})
        dispatch(getUsers());
        
    } catch (error) {
        dispatch({type: FAIL_USER, payload: error.response.data});
    }
};

      