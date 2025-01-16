import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import AppLayout from "./components/AppLayout";
import Home from "./pages/home";
import About from "./pages/about";
import News from './pages/news';
import Activity from './pages/activity';
import Donate from './pages/donate';
import DonateRaise from './pages/donate-raisefunds';
import DonateUnlimit from './pages/donate-unlimited';
import DonateRequest from './pages/donate-request';
import DonateDetail from './pages/donate-detail';
import AdminDonate from './pages/admin/donate';
import Souvenir from './pages/souvenir';
import SouvenirDetail from './pages/souvenirDetail';
import Webboard from './pages/webboard';
import Alumni from './pages/alumni';
import Login from './pages/login';
import Register from './pages/register';
// import Register from './pages/test-regis';
import HomeAdmin from './pages/admin/home-admin';
import PresidentHome from './pages/president/president-home';
import ProtectedRoute from './components/ProtectedRoute';
import AlumniHome from './pages/alumni/alumni-home';
import Profile from './pages/alumni/alumni-profile';


function App() {

  const clientId = '766363116725-8u97fa7f736i56p1vgm3l3261f0neud2.apps.googleusercontent.com';
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:3001/api/session');
  //       setUser(response.data.user || null);
  //     } catch (error) {
  //       setUser(null);
  //     } finally {
  //       setLoading(false); // โหลดเสร็จสิ้น
  //     }
  //   };

  //   fetchUser();
  // }, []);


  

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // const isLoggedIn = !!user;
  // console.log('isLoggedIn:', isLoggedIn, 'user:', user);


  return (

  <GoogleOAuthProvider clientId={clientId}>  
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donateraise" element={<DonateRaise/>} />
          <Route path="/donatunlimit" element={<DonateUnlimit/>} />
          <Route path="/donaterequest" element={<DonateRequest/>} />
          {/* <Route path="/donatedetail" element={<DonateDetail/>} /> */}
          <Route path="/donate/donatedetail/:projectId" element={<DonateDetail />} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/souvenir" element={<Souvenir />} />
          <Route path="/souvenir/souvenirDetail/:productId" element={<SouvenirDetail />} />
          <Route path="/webboard" element={<Webboard />} />
          {/* <Route path="/login" element={
          isLoggedIn ? <Navigate to={`/${user?.role === 1 ? 'admin-home' : user?.role === 2 ? 'president-home' :  user?.role === 3 ? 'alumni-home' : ''}`} replace /> : <Login />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/president-home" element={<PresidentHome />} />
          <Route path="/alumni-home" element={<AlumniHome />} />
          <Route path="/alumni-profile" element={<Profile/>} />
          {/* <Route path="/test-regis" element={<Register />} /> */}
          {/* <Route path="/admin-home" element={<ProtectedRoute  isLoggedIn={isLoggedIn} allowedRoles={[1]}  userRole={user?.role} ><HomeAdmin /></ProtectedRoute>}/>
          <Route path="/president-home" element={<ProtectedRoute  isLoggedIn={isLoggedIn} allowedRoles={[2]}  userRole={user?.role} ><PresidentHome /></ProtectedRoute>}/>
          <Route path="/alumni-home" element={<ProtectedRoute  isLoggedIn={isLoggedIn} allowedRoles={[3]}  userRole={user?.role} ><Profile /></ProtectedRoute>}/> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </GoogleOAuthProvider>
  
  );
}

export default App;
