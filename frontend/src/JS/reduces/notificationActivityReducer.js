//reduces/notificationActivityReducer

const initialState = {
    notifications: [],
    unreadCount: 0,
    unviewedCount: 0,
    loading: false,
    error: null
};

const notificationActivityReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case 'LOAD_Auth':
            return { ...state, loading: true };
        
        case 'GET_NOTIFICATIONS_SUCCESS':
            return { 
                ...state, 
                loading: false, 
                notifications: payload.notifications,
                error: null 
            };
        
        case 'UPDATE_UNREAD_COUNT':
            return {
                ...state,
                unreadCount: payload
            };
        
        case 'UPDATE_UNVIEWED_COUNT':
            return {
                ...state,
                unviewedCount: payload
            };
        
        case 'MARK_NOTIFICATIONS_READ':
            return {
                ...state,
                notifications: state.notifications.map(notif => 
                    payload.notificationIds.includes(notif._id) 
                        ? { ...notif, is_read: true }
                        : notif
                ),
                unreadCount: Math.max(0, state.unreadCount - payload.notificationIds.length)
            };
        
        case 'MARK_ALL_NOTIFICATIONS_READ':
            return {
                ...state,
                notifications: state.notifications.map(notif => ({ ...notif, is_read: true })),
                unreadCount: 0
            };
        
        case 'DELETE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(notif => notif._id !== payload.notificationId),
                unreadCount: Math.max(0, state.unreadCount - 1)
            };
        
        case 'FAIL_AUTH':
            return { 
                ...state, 
                loading: false, 
                error: payload 
            };
        
        default:
            return state;
    }
};

export default notificationActivityReducer;