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
import DonateRequest from './pages/donate-request';
import DonateDetail from './pages/donate-detail';
// import AdminDonate from './pages/admin/donate';
import Souvenir from './pages/souvenir';
import SouvenirDetail from './pages/souvenirDetail';
import SouvenirRequest from './pages/souvenir_request';
import SearchResult from './pages/searchResults';
import Webboard from './pages/webboard';
import Alumni from './pages/alumni';
import Login from './pages/login';
import Register from './pages/register';
import Faq from './pages/faq';
// import Register from './pages/test-regis';
import PresidentHome from './pages/president/president-home';
import ProtectedRoute from './components/ProtectedRoute';
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
// import SouvenirHistory from '../src/pages/alumni/alumni-profile-souvenir';
import AlumniProfileSouvenir from './pages/alumni/alumni-profile-souvenir';
import AlumniProfileActivity from './pages/alumni/alumni-profile-activity';
import SouvenirBasket from './pages/souvenir_basket';
import AlumniMajor from './pages/major-detail';
// import AlumniProfile from './pages/alumni/alumni-profile';
import HomeAlumniProfile from './pages/alumniProfile';

import AlumniOnly from './components/AlumniOnly';
import StudentOnly from './components/StudentOnly';
import PresidentOnly from './components/PresidentOnly';
import AdminOnly from './components/AdminOnly';

import StudentHome from './pages/students/student-home';
import StudentProfile from './pages/students/student-profile';
import StudentProfileWebboard from './pages/students/student-profile-webboard';
import StudentProfileActivity from './pages/students/student-profile-activity';
import StudentProfileSouvenir from './pages/students/student-profile-souvenir';
import StudentEditWebboard from './pages/students/student-editWebboard';


// route ของแอดมิน
import AdminHome from './pages/admin/home';
import AdminEditWebboard from './pages/admin/admin-edit-webboard';
import EditActivity from './pages/admin/edit-activity';
import AdminNews from './pages/admin/admin-news';
import EditNews from './pages/admin/edit-news';
import Calendar from './pages/admin/calendar';
import AdminWebboard from './pages/admin/webboard';
import WebboardDetail from './pages/admin/webboard-detail';
import AdminActivityDetail from './pages/admin/activity-detail';
import Admin from './components/Admin';
import AdminSouvenir from './pages/admin/souvenir';
import AdminActivity from './pages/admin/admin-activity';
import UserManagement from './pages/admin/manage-users';
import UserProfile from './pages/admin/manage-users-profile';
import EditUserProfile from './pages/admin/edit-user-profile';
import AdminAlumni from './pages/admin/admin-alumni';
import AdminAlumniView from './pages/admin/admin-alumniView';
import AdminNewsDetail from './pages/admin/admin-newDetail';

//route ของนายกสมาคม
import ParticipantsPage from './pages/admin/participants';
import PreCreateActivity from './pages/president/president-create-activity';
import PresidentCreateNews from './pages/president/president-create-news';
import PresidentEditActivity from './pages/president/president-edit-activity';
import PresidentEditNews from './pages/president/president-edit-news';
import PresidentProfile from './pages/president/president-profile';
import PresidentProfileActivity from './pages/president/president-profile-activity';
import PresidentProfileWebboard from './pages/president/president-profile-webboard';
import Approve from './pages/president/president-approve';
import PresidentProfileSouvenir from './pages/president/president-profile-souvenir';


function App() {

  const clientId = '766363116725-8u97fa7f736i56p1vgm3l3261f0neud2.apps.googleusercontent.com';

  return (

    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/news" element={<News />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/donate/donaterequest" element={<DonateRequest />} />
            <Route path="/donate/donatedetail/:projectId" element={<DonateDetail />} />
            <Route path="/donate/donatedetail" element={<DonateDetail />} />
            <Route path="/donatedetail" element={<DonateDetail />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/souvenir" element={<Souvenir />} />
            <Route path="/souvenir/souvenir_basket" element={<SouvenirBasket />} />
            <Route path="/souvenir/checkout" element={<SouvenirCheckout />} />
            {/* <Route path="/souvenir/souvenir_history" element={<SouvenirHistory />} /> */}
            <Route path="/souvenir/souvenir_request" element={<SouvenirRequest />} />
            <Route path="/souvenir/souvenirDetail/:productId" element={<SouvenirDetail />} />
            <Route path="/souvenir/souvenirDetail" element={<SouvenirDetail />} />
            <Route path="/webboard" element={<Webboard />} />
            <Route path="/webboard/:id" element={<Webboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/news/:newsId" element={<NewsDetail />} />
            <Route path="/webboard/category/:categoryId" element={<Category />} />
            <Route path="/webboard/category" element={<Category />} />
            <Route path="/activity/:activityId" element={<ActivityDetail />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/alumni/major-detail/:major" element={<AlumniMajor />} />
            <Route path="/alumni/major-detail" element={<AlumniMajor />} />
            <Route path="/searchResult" element={<SearchResult />} />
            <Route path="/alumni/:userId" element={<HomeAlumniProfile />} />
            <Route path="/createPost" element={<CreatePost />} />


            {/* route ของศิษย์เก่า */}
            <Route path="/alumni-home" element={<AlumniOnly><AlumniHome /></AlumniOnly>} />
            <Route path="/alumni-favorite" element={<WebboardFavorite />} />
            <Route path="/alumni-profile/alumni-profile-webboard" element={<AlumniOnly><AlumniProfileWebboard /></AlumniOnly>} />
            <Route path="/alumni-profile/alumni-profile-webboard/edit-webboard/:webboardId" element={<AlumniOnly><EditWebboard /></AlumniOnly>} />
            <Route path="/alumni-profile/alumni-profile-activity" element={<AlumniOnly><AlumniProfileActivity /></AlumniOnly>} />
            <Route path="/alumni-profile/alumni-profile-souvenir" element={<AlumniOnly><AlumniProfileSouvenir /></AlumniOnly>} />
            <Route path="/alumni-profile" element={<AlumniOnly><Profile /></AlumniOnly>} />


            {/* route ของศิษย์ปัจจุบัน */}
            <Route path="/student-profile" element={<StudentOnly><StudentProfile /></StudentOnly>} />
            <Route path="/student-profile/student-profile-webboard" element={<StudentOnly><StudentProfileWebboard /></StudentOnly>} />
            <Route path="/student-profile/student-profile-activity" element={<StudentOnly><StudentProfileActivity /></StudentOnly>} />
            <Route path="/student-profile/student-profile-souvenir" element={<StudentOnly><StudentProfileSouvenir /></StudentOnly>} />
            <Route path="/student-home" element={<StudentOnly><StudentHome /></StudentOnly>} />
            <Route path="/student-profile/student-profile-webboard/edit-webboard/:webboardId" element={<StudentOnly><StudentEditWebboard /></StudentOnly>} />
            <Route path="/student-profile/student-profile-webboard/edit-webboard" element={<StudentOnly><StudentEditWebboard /></StudentOnly>} />

            {/* route ของนายกสมาคม */}
            <Route path="/president-home" element={<PresidentOnly><PresidentHome /></PresidentOnly>} />
            <Route path="/activity/president-create-activity" element={<PresidentOnly><PreCreateActivity /></PresidentOnly>} />
            <Route path="/news/president-create-news" element={<PresidentOnly><PresidentCreateNews /></PresidentOnly>} />
            <Route path="/activity/edit/:activityId" element={<PresidentOnly><PresidentEditActivity /></PresidentOnly>} />
            <Route path="/news/edit/:newsId" element={<PresidentOnly><PresidentEditNews /></PresidentOnly>} />
            <Route path="/president-profile" element={<PresidentOnly><PresidentProfile /></PresidentOnly>} />
            <Route path="/president-profile/president-profile-activity" element={<PresidentOnly><PresidentProfileActivity /></PresidentOnly>} />
            <Route path="/president-profile/president-profile-webboard" element={<PresidentOnly><PresidentProfileWebboard /></PresidentOnly>} />
            <Route path="/president-profile/president-approve" element={<PresidentOnly><Approve /></PresidentOnly>} />
            <Route path="/president-profile/president-profile-souvenir" element={<PresidentOnly><PresidentProfileSouvenir /></PresidentOnly>} />
          </Route>

          {/* route ของแอดมิน */}
          <Route element={<Admin />}>
            <Route path="/admin-home" element={<AdminOnly><AdminHome /></AdminOnly>} />
            <Route path="/admin/souvenir" element={<AdminOnly><AdminSouvenir /></AdminOnly>} />
            <Route path="/admin/activities" element={<AdminOnly><AdminActivity /></AdminOnly>} />
            <Route path="/admin/activities/admin-create-activity" element={<AdminOnly><CreateActivity /></AdminOnly>} />
            <Route path="/admin/activities/:activityId" element={<AdminOnly><AdminActivityDetail /></AdminOnly>} />
            <Route path="/admin/souvenir/souvenir_request" element={<AdminOnly><SouvenirRequest /></AdminOnly>} />
            <Route path="/admin/calendar" element={<AdminOnly><Calendar /></AdminOnly>} />
            <Route path="/admin/webboard" element={<AdminOnly><AdminWebboard /></AdminOnly>} />
            <Route path="/admin/webboard/createPost" element={<AdminOnly><CreatePost /></AdminOnly>} />
            <Route path="/admin/webboard/:webboardId" element={<AdminOnly><WebboardDetail /></AdminOnly>} />
            <Route path="/admin/webboard/edit/:webboardId" element={<AdminOnly><AdminEditWebboard /></AdminOnly>} />
            <Route path="/admin/activities/edit/:activityId" element={<AdminOnly><EditActivity /></AdminOnly>} />
            <Route path="/admin/news" element={<AdminOnly><AdminNews /></AdminOnly>} />
            <Route path="/admin/news/:newsId" element={<AdminOnly><AdminNewsDetail /></AdminOnly>} />
            <Route path="/admin/news/admin-create-news" element={<AdminOnly><CreateNews /></AdminOnly>} />
            <Route path="/admin/news/edit/:newsId" element={<AdminOnly><EditNews /></AdminOnly>} />
            <Route path="/admin/activities/:activityId/participants" element={<AdminOnly><ParticipantsPage /></AdminOnly>} />
            <Route path="/admin/users" element={<AdminOnly><UserManagement /></AdminOnly>} />
            <Route path="/admin/users/user-profile/:userId" element={<AdminOnly><UserProfile /></AdminOnly>} />
            <Route path="/admin/users/edit-user-profile/:userId" element={<AdminOnly><EditUserProfile /></AdminOnly>} />
            <Route path="/admin/admin-alumni" element={<AdminOnly><AdminAlumni /></AdminOnly>} />
            <Route path="/admin/admin-alumni/admin-alumniView/:major" element={<AdminOnly><AdminAlumniView /></AdminOnly>} />


          </Route>
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>

  );
}

export default App;
