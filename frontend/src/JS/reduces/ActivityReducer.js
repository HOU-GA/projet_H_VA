
// reduces/ActivityReducer.js

import { 
    LOAD_Auth, 
    FAIL_AUTH,
    SUCCESS_Auth,
    EDIT_USER
} from "../actionTypes/AuthActionType"

export const ADD_COMMENT_REPLY = 'ADD_COMMENT_REPLY'
export const LIKE_COMMENT = 'LIKE_COMMENT'

const initialState = {
    activities: [],
    activity: null,
    loadActivity: false,
    errors: [],
    success: [],
    pagination: {},
    count: 0,
    filters: {},
    search: {}
}

const activityReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case LOAD_Auth:
            return { ...state, loadActivity: true }
        
        case SUCCESS_Auth:
            console.log('🟢 SUCCESS_AUTH - Payload:', payload);
            
            // ✅ Gestion des activités filtrées/recherche
            if (payload.activities !== undefined) {
                return { 
                    ...state, 
                    loadActivity: false,
                    activities: payload.activities || [],
                    pagination: payload.pagination || state.pagination,
                    count: payload.count || state.count,
                    filters: payload.filters || state.filters,
                    search: payload.search || state.search,
                    errors: [],
                    success: payload.success || []
                }
            }
            
            // ✅ Nouvelle activité créée
            if (payload.activity && !payload.activityId) {
                return { 
                    ...state, 
                    loadActivity: false,
                    activities: [payload.activity, ...state.activities],
                    success: payload.success || [],
                    errors: []
                }
            }
            
            // ✅ Suppression d'activité
            if (payload.activityId) {
                return { 
                    ...state, 
                    loadActivity: false,
                    activities: state.activities.filter(activity => activity._id !== payload.activityId),
                    success: payload.success || [],
                    errors: []
                }
            }
            
            // ✅ Message de succès générique
            if (payload.success) {
                return { 
                    ...state, 
                    loadActivity: false,
                    success: Array.isArray(payload.success) ? payload.success : [payload.success],
                    errors: []
                }
            }
            
            return { ...state, loadActivity: false }
        
        case EDIT_USER:
            console.log('🟢 EDIT_USER - Payload:', payload);
            
            // ✅ LIKE D'ACTIVITÉ
            if (payload.activityId && payload.activity && payload.activity.likes !== undefined) {
                return { 
                    ...state, 
                    loadActivity: false,
                    activities: state.activities.map(activity => 
                        activity._id === payload.activityId ? { 
                            ...activity, 
                            likes: payload.activity.likes,
                            engagement_metrics: payload.activity.engagement_metrics,
                            userHasLiked: payload.activity.userHasLiked
                        } : activity
                    ),
                    errors: []
                }
            }
            
            // ✅ AJOUT DE COMMENTAIRE
            if (payload.activityId && payload.comment) {
                return { 
                    ...state, 
                    loadActivity: false,
                    activities: state.activities.map(activity => 
                        activity._id === payload.activityId ? { 
                            ...activity, 
                            comments: [...(activity.comments || []), payload.comment],
                            engagement_metrics: {
                                ...activity.engagement_metrics,
                                comments_count: (activity.engagement_metrics?.comments_count || 0) + 1
                            }
                        } : activity
                    ),
                    errors: []
                }
            }
            
            // ✅ MODIFICATION D'ACTIVITÉ (UPDATE)
            if (payload.activity && payload.activity._id) {
                console.log('🔄 Mise à jour activité:', payload.activity._id);
                return { 
                    ...state, 
                    loadActivity: false,
                    activities: state.activities.map(activity => 
                        activity._id === payload.activity._id ? payload.activity : activity
                    ),
                    success: payload.success || [{msg: "Activité modifiée avec succès!"}],
                    errors: []
                }
            }
            
            return state

        // ✅ RÉPONSE À UN COMMENTAIRE - NOUVEAU CAS
        case 'REPLY_TO_COMMENT_SUCCESS':
            console.log('🟢 REPLY_TO_COMMENT_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? {
                            ...activity,
                            comments: activity.comments.map(comment =>
                                comment._id === payload.commentId
                                    ? { 
                                        ...comment, 
                                        replies: [...(comment.replies || []), payload.reply] 
                                      }
                                    : comment
                            ),
                            engagement_metrics: {
                                ...activity.engagement_metrics,
                                comments_count: (activity.engagement_metrics?.comments_count || 0) + 1
                            }
                        }
                        : activity
                ),
                errors: []
            }

        // ✅ LIKE DE COMMENTAIRE - NOUVEAU CAS
        case 'LIKE_COMMENT_SUCCESS':
            console.log('🟢 LIKE_COMMENT_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? {
                            ...activity,
                            comments: activity.comments.map(comment =>
                                comment._id === payload.commentId
                                    ? { 
                                        ...comment, 
                                        likes: payload.likes,
                                        userHasLiked: payload.userHasLiked
                                      }
                                    : comment
                            )
                        }
                        : activity
                ),
                errors: []
            }

        // ✅ LIKE DE RÉPONSE - NOUVEAU CAS
        case 'LIKE_REPLY_SUCCESS':
            console.log('🟢 LIKE_REPLY_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? {
                            ...activity,
                            comments: activity.comments.map(comment =>
                                comment._id === payload.commentId
                                    ? {
                                        ...comment,
                                        replies: comment.replies.map(reply =>
                                            reply._id === payload.replyId
                                                ? {
                                                    ...reply,
                                                    likes: payload.likes,
                                                    userHasLiked: payload.userHasLiked
                                                }
                                                : reply
                                        )
                                    }
                                    : comment
                            )
                        }
                        : activity
                ),
                errors: []
            }

        // ✅ SUPPRESSION DE COMMENTAIRE
        case 'DELETE_COMMENT_SUCCESS':
            console.log('🟢 DELETE_COMMENT_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? {
                            ...activity,
                            comments: activity.comments.filter(comment => 
                                comment._id !== payload.commentId
                            ),
                            engagement_metrics: {
                                ...activity.engagement_metrics,
                                comments_count: Math.max(0, (activity.engagement_metrics?.comments_count || 0) - 1)
                            }
                        }
                        : activity
                ),
                errors: []
            }

        // ✅ SUPPRESSION DE RÉPONSE
        case 'DELETE_REPLY_SUCCESS':
            console.log('🟢 DELETE_REPLY_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? {
                            ...activity,
                            comments: activity.comments.map(comment =>
                                comment._id === payload.commentId
                                    ? {
                                        ...comment,
                                        replies: comment.replies.filter(reply => 
                                            reply._id !== payload.replyId
                                        )
                                    }
                                    : comment
                            ),
                            engagement_metrics: {
                                ...activity.engagement_metrics,
                                comments_count: Math.max(0, (activity.engagement_metrics?.comments_count || 0) - 1)
                            }
                        }
                        : activity
                ),
                errors: []
            }

        // ✅ AJOUT D'UTILISATEUR IDENTIFIÉ
        case 'ADD_IDENTIFIED_USER_SUCCESS':
            console.log('🟢 ADD_IDENTIFIED_USER_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? payload.activity
                        : activity
                ),
                errors: []
            }

        // ✅ RETRAIT D'UTILISATEUR IDENTIFIÉ
        case 'REMOVE_IDENTIFIED_USER_SUCCESS':
            console.log('🟢 REMOVE_IDENTIFIED_USER_SUCCESS - Payload:', payload);
            return {
                ...state,
                loadActivity: false,
                activities: state.activities.map(activity => 
                    activity._id === payload.activityId 
                        ? payload.activity
                        : activity
                ),
                errors: []
            }

        // ✅ RÉINITIALISATION DES ERREURS
        case 'CLEAR_ACTIVITY_ERRORS':
            return {
                ...state,
                errors: []
            }

        // ✅ RÉINITIALISATION DES SUCCÈS
        case 'CLEAR_ACTIVITY_SUCCESS':
            return {
                ...state,
                success: []
            }

        // ✅ CHARGEMENT D'ACTIVITÉ SPÉCIFIQUE
        case 'GET_ACTIVITY_BY_ID_SUCCESS':
            return {
                ...state,
                loadActivity: false,
                activity: payload.activity,
                errors: []
            }
        
        case FAIL_AUTH:
            console.log('❌ FAIL_AUTH - Payload:', payload);
            return { 
                ...state, 
                loadActivity: false,
                errors: Array.isArray(payload) ? payload : [payload],
                success: []
            }
        
        default:
            return state
    }
}

export default activityReducer