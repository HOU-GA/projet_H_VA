
// src/App.js - VERSION CORRIGÉE
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/home/Home'
import Register from './pages/register/Register'
import Login from './pages/login/Login'
import Profile from './pages/profile/Profile'
import Error from './pages/error/Error'
import BarreNav from './components/barrenav/BarreNav';
import Footer from './components/footer/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { current } from './JS/actions/AuthAction';
import DashboardUsers from './pages/dashboard/DashboardUsers';
import UserProfileAdmin from './pages/profile/UserProfileAdmin';
import Chat from './pages/chat/ChatPage';
import Activities from './pages/activites/Activities';
import AdminActivities from './pages/admin/AdminActivities';

function App() {
  const dispatch = useDispatch();
  const {isAuth, user} = useSelector(state => state.authReducer)
  
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(current());
    }
  }, [dispatch]);
  
  return (
    <div className="App">
      <BarreNav/>
     
     <Routes>
      {/* Routes publiques */}
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/register' element={<Register/>}/>
      
      {/* Routes protégées */}
      <Route path='/profile' element={isAuth ? <Profile/> : <Login/>}/>
      <Route path='/chat' element={isAuth ? <Chat/> : <Login/>}/>
      <Route path='/activities' element={isAuth ? <Activities/> : <Login/>}/>
      
      {/* ✅ SUPPRIMER : Route notifications inutile */}
      {/* <Route path='/notifications' element={isAuth ? <NotificationsPage/> : <Login/>}/> */}
      
      {/* Routes admin */}
      <Route path='/admin/activities' element={isAdmin ? <AdminActivities/> : <Error/>}/>
      <Route path='/admin' element={isAdmin ? <DashboardUsers/> : <Error/>}/>
      <Route path='/admin/profile/:userId' element={isAdmin ? <UserProfileAdmin/> : <Error/>}/>
      
      {/* Route erreur 404 */}
      <Route path='/*' element={<Error/>}/> 
     </Routes>

     <Footer/>
    </div>
  );
}

export default App;