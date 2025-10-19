

import { combineReducers } from 'redux'
import authReducer from './AuthReducer'
import adminReducer from './AdminReducer'
import activityReducer from './ActivityReducer'
import notificationActivityReducer from './notificationActivityReducer' // ✅ AJOUT
import activityViewReducer from './activityViewReducer' // ✅ AJOUT

const rootReducer = combineReducers({
    authReducer, 
    adminReducer,
    activityReducer,
    notificationActivityReducer, // ✅ AJOUT
    activityViewReducer, // ✅ AJOUT
});

export default rootReducer;