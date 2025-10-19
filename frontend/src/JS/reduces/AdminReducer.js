
  import { 
    DELETE_USER, 
    FAIL_USER, 
    Get_All_USERS, 
    LOAD_USER, 
    GET_USER_REQUEST, 
    GET_USER_SUCCESS, 
    EDIT_USER_SUCCESS
  } from "../actionTypes/AdminActionType";
  
  const initialState = {
      users: [],
      selectedUser: null,
      isLoadUser: false,
      errors: []
  }
  
  const adminReducer = (state = initialState, { type, payload }) => {
    console.log('🟢 ADMIN REDUCER: Action:', type, 'Payload:', payload);
    
    switch (type) {
        case LOAD_USER: 
        case GET_USER_REQUEST:
            return { ...state, isLoadUser: true };
  
        case Get_All_USERS:
            const safeUsers = Array.isArray(payload) ? payload : [];
            console.log('🟢 ADMIN REDUCER: Users à sauvegarder:', safeUsers.length);
            return { 
              ...state, 
              users: safeUsers, 
              isLoadUser: false,
              errors: []
            };
  
        case GET_USER_SUCCESS:
            console.log('🟢 ADMIN REDUCER: Utilisateur sélectionné sauvegardé');
            return { 
              ...state, 
              selectedUser: payload, 
              isLoadUser: false,
              errors: []
            };
  
        // ✅ CORRECTION CRITIQUE : Gérer EDIT_USER_SUCCESS pour les mises à jour admin
        case EDIT_USER_SUCCESS:
            console.log('🟢 ADMIN REDUCER: EDIT_USER_SUCCESS - Mise à jour utilisateur par admin');
            console.log('📦 Payload EDIT_USER_SUCCESS:', payload);
            
            // 🟢 IMPORTANT : Toujours arrêter le loading
            let newState = {
              ...state, 
              isLoadUser: false, // ✅ ARRÊTER LE LOADING
              errors: []
            };
            
            // Si payload contient userToUpdate (structure du backend admin)
            if (payload && payload.userToUpdate) {
                const updatedUser = payload.userToUpdate;
                newState = {
                    ...newState,
                    // Mettre à jour dans la liste des users
                    users: state.users.map(user => 
                        user._id === updatedUser._id ? updatedUser : user
                    ),
                    // Mettre à jour l'utilisateur sélectionné si c'est le même
                    selectedUser: state.selectedUser && state.selectedUser._id === updatedUser._id 
                        ? updatedUser 
                        : state.selectedUser
                };
                console.log('✅ ADMIN REDUCER: Utilisateur mis à jour dans la liste');
            } 
            // Si payload est directement l'utilisateur mis à jour
            else if (payload && payload._id) {
                newState = {
                    ...newState,
                    users: state.users.map(user => 
                        user._id === payload._id ? payload : user
                    ),
                    selectedUser: state.selectedUser && state.selectedUser._id === payload._id 
                        ? payload 
                        : state.selectedUser
                };
                console.log('✅ ADMIN REDUCER: Utilisateur mis à jour directement');
            }
            
            console.log('✅ ADMIN REDUCER: État après EDIT_USER_SUCCESS:', newState);
            return newState;
  
        case DELETE_USER:
            if (!payload?._id) {
                console.warn('⚠️ ADMIN REDUCER: Payload invalide pour DELETE');
                return { ...state, isLoadUser: false };
            }
            const newListUser = state.users.filter(user => user._id !== payload._id);
            return { 
              ...state, 
              users: newListUser, 
              isLoadUser: false,
              errors: []
            };
  
        case FAIL_USER:
            return { 
              ...state, 
              isLoadUser: false, // ✅ ARRÊTER LE LOADING en cas d'erreur
              errors: payload,
              selectedUser: null
            };
  
        default:
            return state;
    }
  }
  
  export default adminReducer;