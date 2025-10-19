// actions/NotificationAction.js - NOUVEAU FICHIER
import { 
    ChatActionTypes 
} from '../reducers/ChatReducer';

// Charger les notifications
export const loadNotifications = () => async (dispatch, getState) => {
    try {
        const response = await fetch('/api/notifications', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            dispatch({
                type: ChatActionTypes.SET_NOTIFICATIONS,
                payload: data.data.notifications
            });
            return data;
        } else {
            throw new Error('Erreur lors du chargement des notifications');
        }
    } catch (error) {
        console.error('❌ Erreur chargement notifications:', error);
        throw error;
    }
};

// Marquer comme lu
export const markNotificationsAsRead = (notificationIds) => async (dispatch, getState) => {
    try {
        const response = await fetch('/api/notifications/mark-read', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ notificationIds })
        });
        
        if (response.ok) {
            // Recharger les notifications après marquage
            dispatch(loadNotifications());
            return { success: true };
        } else {
            throw new Error('Erreur lors du marquage des notifications');
        }
    } catch (error) {
        console.error('❌ Erreur marquage notifications:', error);
        throw error;
    }
};

// Marquer toutes comme lues
export const markAllNotificationsAsRead = () => async (dispatch, getState) => {
    try {
        const response = await fetch('/api/notifications/mark-all-read', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            // Recharger les notifications après marquage
            dispatch(loadNotifications());
            return { success: true };
        } else {
            throw new Error('Erreur lors du marquage des notifications');
        }
    } catch (error) {
        console.error('❌ Erreur marquage toutes notifications:', error);
        throw error;
    }
};

// Supprimer une notification
export const deleteNotification = (notificationId) => async (dispatch, getState) => {
    try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            // Recharger les notifications après suppression
            dispatch(loadNotifications());
            return { success: true };
        } else {
            throw new Error('Erreur lors de la suppression de la notification');
        }
    } catch (error) {
        console.error('❌ Erreur suppression notification:', error);
        throw error;
    }
};