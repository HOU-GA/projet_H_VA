
//code proposer 15-10-25 14.09
// JS/actions/ActivityAction.js
import { 
    LOAD_Auth, 
    FAIL_AUTH,
    SUCCESS_Auth,
    EDIT_USER
} from "../actionTypes/AuthActionType"
import axios from 'axios'

const getConfig = () => ({
    headers: {
        authorization: localStorage.getItem("token")
    }
})

// ✅ Action pour les activités filtrées
export const getFilteredActivities = (page = 1, limit = 20, filters = {}) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });

        console.log('🟢 GET FILTERED ACTIVITIES - Filters:', filters);

        const result = await axios.get(
            `/api/activity/filtered?${queryParams}`, 
            getConfig()
        );
        
        console.log('✅ ACTIVITÉS FILTRÉES CHARGÉES:', result.data.activities?.length);
        
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                activities: result.data.activities,
                pagination: result.data.pagination,
                count: result.data.count,
                filters: result.data.filters,
                isAuth: true
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR CHARGEMENT ACTIVITÉS FILTRÉES:', error.response?.data);
        dispatch({
            type: FAIL_AUTH, 
            payload: error.response?.data?.errors || [{ msg: 'Erreur de chargement des activités filtrées' }]
        });
        throw error;
    }
};

// ✅ Action de recherche avancée
export const searchActivities = (searchParams) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const queryParams = new URLSearchParams();
        
        Object.keys(searchParams).forEach(key => {
            if (searchParams[key] !== undefined && searchParams[key] !== '') {
                queryParams.append(key, searchParams[key]);
            }
        });

        console.log('🟢 SEARCH ACTIVITIES - Params:', searchParams);

        const result = await axios.get(
            `/api/activity/search?${queryParams}`, 
            getConfig()
        );
        
        console.log('✅ RECHERCHE EFFECTUÉE:', result.data.activities?.length);
        
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                activities: result.data.activities,
                pagination: result.data.pagination,
                count: result.data.count,
                search: result.data.search,
                isAuth: true
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR RECHERCHE ACTIVITÉS:', error.response?.data);
        dispatch({
            type: FAIL_AUTH, 
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de la recherche' }]
        });
        throw error;
    }
};

// ✅ CORRECTION COMPLÈTE : Action createActivity
export const createActivity = (activityData, navigate) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        console.log('🟢 ACTION CREATE ACTIVITY: Démarrage avec:', activityData);
        
        // ✅ FORMATAGE des données pour le backend
        const formattedData = {
            general_activity: activityData.general_activity,
            activity_type: activityData.activity_type,
            start_date: activityData.start_date,
            start_time: activityData.start_time,
            end_date: activityData.end_date,
            end_time: activityData.end_time,
            activity_subject: activityData.activity_subject,
            description: activityData.description,
            notes: activityData.notes,
            visibility: activityData.visibility,
            identified_users_ids: activityData.identified_users_ids || [],
            uploads: activityData.uploads || []
        };

        console.log('📤 DONNÉES FORMATÉES POUR ENVOI:', formattedData);

        const result = await axios.post("/api/activity/", formattedData, getConfig());
        console.log('✅ ACTION CREATE ACTIVITY: Réponse serveur:', result.data);
        
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                activity: result.data.activity,
                success: [{msg: "Activité créée avec succès!"}],
                isAuth: true
            }
        });
        
        if (navigate) {
            navigate('/activities');
        }
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ACTION CREATE ACTIVITY: Erreur détaillée:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        const errorMessage = error.response?.data?.errors || 
                           error.response?.data?.message || 
                           [{ msg: 'Erreur de création d\'activité' }];
        
        dispatch({
            type: FAIL_AUTH, 
            payload: errorMessage
        });
        throw error;
    }
}


// ✅ CORRECTION : Action updateActivity - URL CORRIGÉE
export const updateActivity = (activityId, activityData) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        console.log('🔄 ACTION UPDATE ACTIVITY: Démarrage avec:', { activityId, activityData });
        
        // ✅ CORRECTION : URL CORRECTE selon vos routes
        const result = await axios.put(
            `/api/activity/${activityId}`, // ✅ CORRECT : /api/activity/:id
            activityData, 
            getConfig()
        );
        
        console.log('✅ ACTION UPDATE ACTIVITY: Réponse serveur:', result.data);
        
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                activity: result.data.activity,
                success: [{msg: "Activité modifiée avec succès!"}],
                isAuth: true
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ACTION UPDATE ACTIVITY: Erreur détaillée:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        const errorMessage = error.response?.data?.errors || 
                           error.response?.data?.message || 
                           [{ msg: 'Erreur de modification d\'activité' }];
        
        dispatch({
            type: FAIL_AUTH, 
            payload: errorMessage
        });
        throw error;
    }
}


// ✅ CORRECTION COMPLÈTE : Action replyToComment
export const replyToComment = (activityId, commentId, replyData) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        console.log('🟢 ACTION REPLY TO COMMENT:', { activityId, commentId, replyData });
        
        const result = await axios.post(
            `/api/activity/${activityId}/comments/${commentId}/reply`,
            replyData,
            getConfig()
        );
        
        console.log('✅ RÉPONSE AJOUTÉE:', result.data);
        
        dispatch({
            type: 'REPLY_TO_COMMENT_SUCCESS',
            payload: {
                activityId,
                commentId,
                reply: result.data.reply
            }
        });
        
        return result.data;
    } catch (error) {
        console.error('❌ ERREUR RÉPONSE:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de la réponse' }]
        });
        throw error;
    }
}

// ✅ CORRECTION COMPLÈTE : Action likeComment
export const likeComment = (activityId, commentId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        console.log('🟢 ACTION LIKE COMMENT:', { activityId, commentId });
        
        const result = await axios.post(
            `/api/activity/${activityId}/comments/${commentId}/like`,
            {},
            getConfig()
        );
        
        console.log('✅ LIKE COMMENTAIRE:', result.data);
        
        dispatch({
            type: 'LIKE_COMMENT_SUCCESS',
            payload: {
                activityId,
                commentId,
                likes: result.data.comment.likes,
                userHasLiked: result.data.comment.userHasLiked
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR LIKE COMMENTAIRE:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors du like du commentaire' }]
        });
        throw error;
    }
}



// ✅ CORRECTION : Action likeReply
export const likeReply = (activityId, commentId, replyId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.post(
            `/api/activity/${activityId}/comments/${commentId}/replies/${replyId}/like`,
            {},
            getConfig()
        );
        
        console.log('✅ LIKE RÉPONSE:', result.data);
        
        dispatch({
            type: EDIT_USER,
            payload: {
                activityId,
                commentId,
                replyId,
                likes: result.data.reply.likes,
                userHasLiked: result.data.reply.userHasLiked
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR LIKE RÉPONSE:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors du like de la réponse' }]
        });
        throw error;
    }
}

// ✅ CORRECTION : Action addComment
export const addComment = (activityId, commentData) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.post(
            `/api/activity/${activityId}/comment`, 
            commentData, 
            getConfig()
        );
        
        console.log('✅ COMMENTAIRE AJOUTÉ:', result.data);
        
        dispatch({
            type: EDIT_USER,
            payload: {
                activityId: activityId,
                comment: result.data.comment
            }
        });
        
        return result.data;
    } catch (error) {
        console.error('❌ ERREUR COMMENTAIRE:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur d\'ajout de commentaire' }]
        });
        throw error;
    }
}

// ✅ CORRECTION : Action likeActivity
export const likeActivity = (activityId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.post(
            `/api/activity/${activityId}/like`, 
            {}, 
            getConfig()
        );
        
        console.log('✅ LIKE ACTIVITÉ:', result.data);
        
        dispatch({
            type: EDIT_USER, 
            payload: {
                activityId: activityId,
                activity: result.data.activity
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR LIKE ACTIVITÉ:', error.response?.data);
        dispatch({
            type: FAIL_AUTH, 
            payload: error.response?.data?.errors || [{ msg: 'Erreur de like' }]
        });
        throw error;
    }
}

// ✅ CORRECTION : Action getAllActivities
export const getAllActivities = (page = 1, limit = 10) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.get(
            `/api/activity/all?page=${page}&limit=${limit}`, 
            getConfig()
        );
        
        console.log('✅ ACTIVITÉS CHARGÉES:', result.data.activities?.length);
        
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                activities: result.data.activities,
                pagination: result.data.pagination,
                count: result.data.count,
                isAuth: true
            }
        });
        
    } catch (error) {
        console.error('❌ ERREUR CHARGEMENT ACTIVITÉS:', error.response?.data);
        dispatch({
            type: FAIL_AUTH, 
            payload: error.response?.data?.errors || [{ msg: 'Erreur de chargement des activités' }]
        });
    }
}

// ✅ CORRECTION : Action getUserActivities
export const getUserActivities = (userId, page = 1, limit = 10) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.get(
            `/api/activity/user/${userId}?page=${page}&limit=${limit}`, 
            getConfig()
        );
        
        dispatch({
            type: SUCCESS_Auth, 
            payload: {
                activities: result.data.activities,
                pagination: result.data.pagination,
                count: result.data.count,
                isAuth: true
            }
        });
        
    } catch (error) {
        console.error('❌ ERREUR ACTIVITÉS UTILISATEUR:', error.response?.data);
        dispatch({
            type: FAIL_AUTH, 
            payload: error.response?.data?.errors || [{ msg: 'Erreur de chargement des activités utilisateur' }]
        });
    }
}

export const deleteActivity = (activityId) => async (dispatch) => {
    try {
        console.log('🗑️ DELETE ACTIVITY ACTION - ID:', activityId);
        
        dispatch({
            type: LOAD_Auth
        });

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
        };

        // ✅ CORRECTION : Utiliser la bonne URL selon vos routes
        const res = await axios.delete(`/api/activity/${activityId}`, config);
        
        console.log('✅ ACTIVITÉ SUPPRIMÉE:', res.data);

        dispatch({
            type: SUCCESS_Auth,
            payload: res.data
        });

        // Recharger les activités après suppression
        dispatch(getFilteredActivities(1, 20, { viewMode: 'all' }));

    } catch (error) {
        console.error('❌ ERREUR SUPPRESSION ACTIVITÉ:', error.response?.data || error.message);
        
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de la suppression' }]
        });
    }
};

// ✅ CORRECTION : Action getUsersForMention
export const getUsersForMention = () => async (dispatch) => {
    try {
        const result = await axios.get(
            "/api/activity/mention/users", 
            getConfig()
        );
        
        console.log('✅ UTILISATEURS POUR MENTION:', result.data.users?.length);
        
        return result.data.users;
        
    } catch (error) {
        console.error('❌ ACTION GET USERS MENTION: Erreur', error.response?.data);
        throw error;
    }
}

// ✅ CORRECTION : Action deleteComment
export const deleteComment = (activityId, commentId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.delete(
            `/api/activity/${activityId}/comments/${commentId}`,
            getConfig()
        );
        
        console.log('✅ COMMENTAIRE SUPPRIMÉ:', result.data);
        
        dispatch({
            type: EDIT_USER,
            payload: {
                activityId,
                commentId,
                success: result.data.success
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR SUPPRESSION COMMENTAIRE:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de la suppression du commentaire' }]
        });
        throw error;
    }
}

// ✅ CORRECTION : Action deleteReply
export const deleteReply = (activityId, commentId, replyId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.delete(
            `/api/activity/${activityId}/comments/${commentId}/replies/${replyId}`,
            getConfig()
        );
        
        console.log('✅ RÉPONSE SUPPRIMÉE:', result.data);
        
        dispatch({
            type: EDIT_USER,
            payload: {
                activityId,
                commentId,
                replyId,
                success: result.data.success
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR SUPPRESSION RÉPONSE:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de la suppression de la réponse' }]
        });
        throw error;
    }
}

// ✅ CORRECTION : Action getActivityById
export const getActivityById = (activityId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.get(
            `/api/activity/${activityId}`,
            getConfig()
        );
        
        console.log('✅ ACTIVITÉ PAR ID:', result.data);
        
        dispatch({
            type: SUCCESS_Auth,
            payload: {
                activity: result.data.activity,
                isAuth: true
            }
        });
        
        return result.data.activity;
        
    } catch (error) {
        console.error('❌ ERREUR ACTIVITÉ PAR ID:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de la récupération de l\'activité' }]
        });
        throw error;
    }
}

// ✅ CORRECTION : Action addIdentifiedUser
export const addIdentifiedUser = (activityId, userId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.post(
            `/api/activity/${activityId}/identified-users`,
            { userId },
            getConfig()
        );
        
        console.log('✅ UTILISATEUR IDENTIFIÉ AJOUTÉ:', result.data);
        
        dispatch({
            type: EDIT_USER,
            payload: {
                activityId: activityId,
                activity: result.data.activity
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR AJOUT UTILISATEUR IDENTIFIÉ:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors de l\'ajout de l\'utilisateur identifié' }]
        });
        throw error;
    }
};

// ✅ CORRECTION : Action removeIdentifiedUser
export const removeIdentifiedUser = (activityId, userId) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.delete(
            `/api/activity/${activityId}/identified-users/${userId}`,
            getConfig()
        );
        
        console.log('✅ UTILISATEUR IDENTIFIÉ RETIRÉ:', result.data);
        
        dispatch({
            type: EDIT_USER,
            payload: {
                activityId: activityId,
                activity: result.data.activity
            }
        });
        
        return result.data;
        
    } catch (error) {
        console.error('❌ ERREUR RETRAIT UTILISATEUR IDENTIFIÉ:', error.response?.data);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur lors du retrait de l\'utilisateur identifié' }]
        });
        throw error;
    }
};

// ✅ CORRECTION : Action clearActivityErrors
export const clearActivityErrors = () => (dispatch) => {
    dispatch({
        type: FAIL_AUTH,
        payload: []
    });
}

// ✅ CORRECTION : Action clearActivitySuccess
export const clearActivitySuccess = () => (dispatch) => {
    dispatch({
        type: SUCCESS_Auth,
        payload: {
            success: [],
            isAuth: true
        }
    });
} 
