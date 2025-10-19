// src/JS/reduces/activityViewReducer.js
const initialState = {
    activityViews: [],
    unviewedActivities: [],
    loading: false,
    error: null
};

const activityViewReducer = (state = initialState, { type, payload }) => {
    switch (type) {
        case 'LOAD_Auth':
            return { ...state, loading: true };
        
        case 'GET_ACTIVITY_VIEWS_SUCCESS':
            return { 
                ...state, 
                loading: false, 
                activityViews: payload,
                error: null 
            };
        
        case 'GET_UNVIEWED_ACTIVITIES_SUCCESS':
            return {
                ...state,
                loading: false,
                unviewedActivities: payload,
                error: null
            };
        
        case 'MARK_ACTIVITY_VIEWED_SUCCESS':
            return {
                ...state,
                unviewedActivities: state.unviewedActivities.filter(id => id !== payload.activityId),
                error: null
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

export default activityViewReducer;