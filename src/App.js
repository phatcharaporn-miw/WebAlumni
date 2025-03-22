import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { LanguageProvider } from './context/LanguageContext';
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
import SouvenirBasket from './pages/souvenir_basket';
import SouvenirDetail from './pages/souvenirDetail';
import Webboard from './pages/webboard';
import Alumni from './pages/alumni';
import Login from './pages/login';
import Register from './pages/register';
import Faq from './pages/faq';
// import Register from './pages/test-regis';
import AdminHome from './pages/admin/admin-home';
import PresidentHome from './pages/president/president-home';
// import ProtectedRoute from './components/ProtectedRoute';
import AlumniHome from './pages/alumni/alumni-home';
import Profile from './pages/alumni/alumni-profile';
import CreatePost from './pages/createPost';
import WebboardFavorite from './pages/alumni/alumni-favorite';
import CreateNews from './pages/admin/admin-create-news';
import NewsDetail from './pages/newsDetail';
import CreateActivity from './pages/admin/admin-create-activity';
import Notifications from './components/Notification';
import Category from './pages/category';
import AlumniProfileWebboard from './pages/alumni/alumni-profile-webboard';
import EditWebboard from './pages/alumni/editWebboard';
import ActivityDetail from "./pages/activityDetail";
import ForgotPassword from './pages/forgotPassword';
import SouvenirCheckout from './pages/souvenir_checkout';
import SouvenirHistory from './pages/souvenir_history';

function App() { 

  const clientId = '766363116725-8u97fa7f736i56p1vgm3l3261f0neud2.apps.googleusercontent.com';


  return (

  <GoogleOAuthProvider clientId={clientId}>  
    <BrowserRouter>
      <Routes>
        <Route  element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/donateraise" element={<DonateRaise/>} />
          <Route path="/donatunlimit" element={<DonateUnlimit/>} />
          <Route path="/donaterequest" element={<DonateRequest/>} />
          <Route path="/donatedetail" element={<DonateDetail/>} />
          <Route path="/alumni" element={<Alumni />} />
          <Route path="/souvenir" element={<Souvenir />} />
          <Route path="/souvenir/souvenir_basket" element={<SouvenirBasket />} />
          <Route path="/souvenir/checkout" element={<SouvenirCheckout />} />
          <Route path="/souvenir/souvenir_history" element={<SouvenirHistory />} />
          
         
          <Route path="/souvenir/souvenirDetail/:productId" element={<SouvenirDetail />} />
          <Route path="/webboard" element={<Webboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/president-home" element={<PresidentHome />} />
          <Route path="/alumni-home" element={<AlumniHome />} />
          <Route path="/alumni-profile" element={<Profile/>} />
          <Route path="/createPost" element={<CreatePost/>} />
          <Route path="/alumni-favorite" element={<WebboardFavorite/>} />
          <Route path="/news/:newsId" element={<NewsDetail/>} />
          <Route path="/notification" element={<Notifications/>} />
          <Route path="/webboard/:categoryId" element={<Category/>} />
          <Route path="/alumni-profile-webboard" element={<AlumniProfileWebboard />} />
          <Route path="/edit-webboard/:webboardId" element={<EditWebboard />} />
          <Route path="/activity/:activityId" element={<ActivityDetail />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          
          {/* for admin */}
          <Route path="/admin-home" element={<AdminHome/>} />
          <Route path="/admin-create-activity" element={<CreateActivity/>} />
          <Route path="/admin-create-news" element={<CreateNews/>} />
        </Route>
      </Routes>
     
    </BrowserRouter>
  </GoogleOAuthProvider>
  
  );
}

export default App;
