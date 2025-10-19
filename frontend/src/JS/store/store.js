
// src/JS/store/store.js - GARDER L'ANCIEN CODE FONCTIONNEL
import { applyMiddleware, compose, createStore } from "redux"
import { thunk } from 'redux-thunk'
import rootReducer from "../reduces"; // ✅ Import depuis le dossier parent

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(thunk))
)

export default store; 