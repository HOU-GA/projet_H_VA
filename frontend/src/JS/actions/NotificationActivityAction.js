//actions/NotificationActivityAction.js


import {
    LOAD_Auth,
    SUCCESS_Auth,
    FAIL_AUTH
} from "../actionTypes/AuthActionType";
import axios from 'axios';

const getConfig = () => ({
    headers: {
        authorization: localStorage.getItem("token")
    }
});

// ✅ Récupérer les notifications
export const getNotifications = (page = 1, limit = 20) => async (dispatch) => {
    dispatch({ type: LOAD_Auth });
    try {
        const result = await axios.get(
            `/api/notification-activity?page=${page}&limit=${limit}`,
            getConfig()
        );

        dispatch({
            type: 'GET_NOTIFICATIONS_SUCCESS',
            payload: result.data
        });

        return result.data;
    } catch (error) {
        console.error('❌ Erreur get notifications:', error);
        dispatch({
            type: FAIL_AUTH,
            payload: error.response?.data?.errors || [{ msg: 'Erreur de chargement des notifications' }]
        });
        throw error;
    }
};

// ✅ Marquer comme lu
export const markAsRead = (notificationIds) => async (dispatch) => {
    try {
        const result = await axios.post(
            '/api/notification-activity/mark-read',
            { notificationIds },
            getConfig()
        );

        dispatch({
            type: 'MARK_NOTIFICATIONS_READ',
            payload: { notificationIds }
        });

        return result.data;
    } catch (error) {
        console.error('❌ Erreur mark as read:', error);
        throw error;
    }
};

// ✅ Marquer tout comme lu
export const markAllAsRead = () => async (dispatch) => {
    try {
        const result = await axios.post(
            '/api/notification-activity/mark-all-read',
            {},
            getConfig()
        );

        dispatch({
            type: 'MARK_ALL_NOTIFICATIONS_READ'
        });

        return result.data;
    } catch (error) {
        console.error('❌ Erreur mark all as read:', error);
        throw error;
    }
};

// ✅ Supprimer une notification
export const deleteNotification = (notificationId) => async (dispatch) => {
    try {
        const result = await axios.delete(
            `/api/notification-activity/${notificationId}`,
            getConfig()
        );

        dispatch({
            type: 'DELETE_NOTIFICATION',
            payload: { notificationId }
        });

        return result.data;
    } catch (error) {
        console.error('❌ Erreur delete notification:', error);
        throw error;
    }
};

// ✅ Récupérer le compteur de notifications non lues
export const getUnreadCount = () => async (dispatch) => {
    try {
        const result = await axios.get(
            '/api/notification-activity/unread-count',
            getConfig()
        );

        dispatch({
            type: 'UPDATE_UNREAD_COUNT',
            payload: result.data.unreadCount
        });

        return result.data;
    } catch (error) {
        console.error('❌ Erreur get unread count:', error);
        throw error;
    }
};

// ✅ NOUVEAU : Compteur d'activités non vues
export const getUnviewedActivitiesCount = () => async (dispatch) => {
    try {
        const result = await axios.get(
            '/api/notification-activity/unviewed-count',
            getConfig()
        );

        dispatch({
            type: 'UPDATE_UNVIEWED_COUNT',
            payload: result.data.unviewedCount
        });

        return result.data;
    } catch (error) {
        console.error('❌ Erreur get unviewed count:', error);
        // Ne pas throw l'erreur pour ne pas bloquer l'application
        return { unviewedCount: 0 };
    }
};

// ✅ Action pour marquer toutes les activités comme vues
export const markAllActivitiesAsViewed = () => async (dispatch) => {
    try {
        const result = await axios.post(
            '/api/activity/mark-all-viewed',
            {},
            getConfig()
        );

        // Recharger le compteur après marquage
        dispatch(getUnviewedActivitiesCount());

        return result.data;
    } catch (error) {
        console.error('❌ Erreur mark all as viewed:', error);
        throw error;
    }
};