
//reduces/AuthReducer.js

import { CURRENT_AUTH, EDIT_USER, FAIL_AUTH, LOAD_Auth, LOGOUT_AUTH, SUCCESS_Auth } from "../actionTypes/AuthActionType";

const initialState = {
    isLoad: false,
    users:[],
    user: {},
    errors: [],
    success: [],
    isAuth: false,
    userId: null,
    role: null
}

const authReducer = (state = initialState, {type, payload}) => {
  console.log('🔐 AUTH REDUCER: Action:', type, 'Payload:', payload);
  
  switch (type) {
      case LOAD_Auth:
          return {...state, isLoad:true}

      case SUCCESS_Auth:
          console.log('✅ AUTH REDUCER: SUCCESS_Auth - Setting isAuth: true');
          console.log('📦 PAYLOAD STRUCTURE:', payload);
          
          // ✅ CORRECTION : Stocker le token
          if (payload.token) {
            localStorage.setItem("token", payload.token);
          }
          
          // ✅ CORRECTION CRITIQUE : Structure cohérente avec rôle et userId
          const userData = payload.user || payload;
          console.log('👤 USER DATA STRUCTURE:', userData);
          
          return {
              ...state,
              isLoad: false,
              user: userData,
              // ✅ CORRECTION : Stocker userId et role depuis userData
              userId: userData._id || userData.id || payload._id || payload.id,
              role: userData.role || payload.role,
              success: payload.success,
              isAuth: true,
          }
    
      case CURRENT_AUTH:
          console.log('🔐 AUTH REDUCER: CURRENT_AUTH - Payload:', payload);
          return {
              ...state,
              isLoad: false,
              user: payload,
              // ✅ CORRECTION : Stocker userId et role depuis payload
              userId: payload._id || payload.id,
              role: payload.role,
              isAuth: true,
          }

      case EDIT_USER:
          console.log('🔐 AUTH REDUCER: EDIT_USER - Payload:', payload);
          return {
              ...state,
              isLoad: false,
              user: state.users.map(user=>user._id===payload.id? {...user, ...payload.userToEdit}:user)
          };

      case LOGOUT_AUTH: 
          localStorage.removeItem('token');
          return {
              ...initialState
          }

      case FAIL_AUTH: 
          return {
              ...state,
              isLoad: false,
              errors: payload,
          } 
      
      default:
          return state;
  }
}

export default authReducer; 
