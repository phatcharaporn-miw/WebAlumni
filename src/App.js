// import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Suspense, lazy } from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { CartProvider } from './context/CartContext'; 
import { AuthProvider } from './context/AuthContext';
// import { UserProvider } from "./context/UserContext";
import About from "./pages/about";
import News from './pages/news';
import Activity from './pages/activity';
import Donate from './pages/donate';
import DonateRequest from './pages/donate-request';
import DonateDetail from './pages/donate-detail';
import Souvenir from './pages/souvenir';
import SouvenirDetail from './pages/souvenirDetail';
import SouvenirRequest from './pages/souvenir_request';
import SearchResult from './pages/searchResults';
import Login from './pages/login';
import Register from './pages/register';
import Faq from './pages/faq';
import PresidentHome from './pages/president/president-home';
import AlumniHome from './pages/alumni/alumni-home';
import Profile from './pages/alumni/alumni-profile';
import CreatePost from './pages/createPost';
import WebboardFavorite from './pages/alumni/alumni-favorite';
import CreateNews from './pages/admin/admin-create-news';
import NewsDetail from './pages/newsDetail';
import CreateActivity from './pages/admin/admin-create-activity';
import Category from './pages/category';
import AlumniProfileWebboard from './pages/alumni/alumni-profile-webboard';
import EditWebboard from './pages/alumni/editWebboard';
import ActivityDetail from "./pages/activityDetail";
import ForgotPassword from './pages/forgotPassword';
import SouvenirCheckout from './pages/souvenir_checkout';
import AlumniProfileSouvenir from './pages/alumni/alumni-profile-souvenir';
import AlumniProfileActivity from './pages/alumni/alumni-profile-activity';
import SouvenirBasket from './pages/souvenir_basket';
import HomeAlumniProfile from './pages/alumniProfile';
import AlumniProfileRequest from './pages/alumni/alumni-request';
import ChangePassword from './pages/change-password';
import AlumniProfileDonation from './pages/alumni/alumni-profile-donation';
import AlumniManageOrders from './pages/alumni/alumni-manage-orders';
import CheckFullName from './pages/check-fullName';
import DonateConfirm from './pages/donate-confirm';
import DashboardStatic from './pages/dashboard-stat';
import DashboardActivitiesPage from './pages/dashboard-activity';
import DashboardDonationPage from './pages/dashboard-donation';
import DashboardProjectsPage from './pages/dashboard-project';
import DashboardAlumniPage from './pages/dashboard-alumni';
import DonationAll from './pages/donation-all';

// ส่วนของ การ import component ที่ใช้สำหรับการตรวจสอบสิทธิ์
import AlumniOnly from './components/AlumniOnly';
import StudentOnly from './components/StudentOnly';
import PresidentOnly from './components/PresidentOnly';
import AdminOnly from './components/AdminOnly';

// import for student
import StudentHome from './pages/students/student-home';
import StudentProfile from './pages/students/student-profile';
import StudentProfileWebboard from './pages/students/student-profile-webboard';
import StudentProfileActivity from './pages/students/student-profile-activity';
import StudentProfileSouvenir from './pages/students/student-profile-souvenir';
import StudentEditWebboard from './pages/students/student-editWebboard';
import StudentProfileRequest from './pages/students/student-request';
import StudentProfileDonation from './pages/students/student-profile-donation';
import StudentManageOrders from './pages/students/student-manage-orders';

// import ของแอดมิน
import AdminHome from './pages/admin/home';
import AdminEditWebboard from './pages/admin/admin-edit-webboard';
import EditActivity from './pages/admin/edit-activity';
import AdminNews from './pages/admin/admin-news';
import EditNews from './pages/admin/edit-news';
import AdminVerifySlip from './pages/admin/verify';
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
import AdminDonate from './pages/admin/admin-donate';
// import AdminOrderManager from './pages/admin/admin-manage-orders';
import AdminCheckPaymentDonateDetail from './pages/admin/admin-donate-checkPayment-detail';
import AdminEditProject from './pages/admin/admin-donate-edit';
import AdminDonateRequest from './pages/admin/admin-donate-request';
import AdminProjectDetail from './pages/admin/admin-donate-detail';
import AddUser from './pages/admin/add-user';
import ProductSlots from './pages/admin/product-slot';


//import ของนายกสมาคม
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
import PresidentProfileDonation from './pages/president/president-profile-donation';
import PresidentManageOrders from './pages/president/president-manage-orders';
import PresidentSummaryAll from './pages/president/president-summary-all';
import PresidentOrdersList from './pages/president/president-orderlist';

const AlumniMajor = lazy(() => import("./pages/major-detail"));
const Webboard = lazy(() => import("./pages/webboard"));
const Home = lazy(() => import("./pages/home"));
const Alumni = lazy(() => import("./pages/alumni"));
const AdminOrderManager = lazy(() => import("./pages/admin/admin-manage-orders"));
const AdminDashboarsProjectsPage = lazy(() => import("./pages/admin/admin-dashboard-project"));
const AdminDashboardActivitiesPages = lazy(() => import("./pages/admin/admin-dashboard-activity"));
const AdminDashboardDonationsPage = lazy(() => import("./pages/admin/admin-dashboard-donation"));
const AdminDashboardAlumniPage = lazy(() => import("./pages/admin/admin-dashboard-alumni"));
const DonationGeneral = lazy(() => import("./pages/donate-general"));
const DonationSummaryDetail = lazy(() => import("./pages/donation-summary-detail"));
const AdminDonationLists = lazy(() => import("./pages/admin/admin-donate-list"));
const WalkInDonationForm = lazy(() => import("./pages/admin/admin-donate-walkin"));

function App() {
  const clientId = '766363116725-8u97fa7f736i56p1vgm3l3261f0neud2.apps.googleusercontent.com';

  return (
      <BrowserRouter>
       {/* <UserProvider>  */}
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><Home /></Suspense>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/donate" element={<Donate />} />
                  <Route path="/donate/donaterequest" element={<DonateRequest />} />
                  <Route path="/donate/donatedetail/:projectId" element={<DonateDetail />} />
                  <Route path="/donate/donatedetail" element={<DonateDetail />} />
                  <Route path="/donatedetail" element={<DonateDetail />} />
                  <Route path="/alumni" element={<Suspense fallback={<div>Loading...</div>}><Alumni /></Suspense>} />
                  <Route path="/souvenir" element={<Souvenir />} />
                  <Route path="/souvenir/souvenir_basket" element={<SouvenirBasket />} />
                  <Route path="/souvenir/checkout" element={<SouvenirCheckout />} />
                  <Route path="/souvenir/souvenir_request" element={<SouvenirRequest />} />
                  <Route path="/souvenir/souvenirDetail/:productId" element={<SouvenirDetail />} />
                  <Route path="/souvenir/souvenirDetail" element={<SouvenirDetail />} />
                  <Route path="/webboard" element={<Suspense fallback={<div>Loading...</div>}><Webboard /></Suspense>} />
                  <Route path="/webboard/:id" element={<Suspense fallback={<div>Loading...</div>}><Webboard /></Suspense>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/news/:newsId" element={<NewsDetail />} />
                  <Route path="/webboard/category/:categoryId" element={<Category />} />
                  <Route path="/webboard/category" element={<Category />} />
                  <Route path="/activity/:activityId" element={<ActivityDetail />} />
                  <Route path="/forgotPassword" element={<ForgotPassword />} />
                  <Route path="/alumni/major-detail/:major" element={<Suspense fallback={<div>Loading...</div>}><AlumniMajor /></Suspense>} />
                  <Route path="/alumni/major-detail" element={<AlumniMajor />} />
                  <Route path="/search" element={<SearchResult />} />
                  <Route path="/alumni/:userId" element={<HomeAlumniProfile />} />
                  <Route path="/createPost" element={<CreatePost />} />
                  <Route path="/check-fullName" element={<CheckFullName />} />
                  <Route path="/donate/donatedetail/donateconfirm/:id" element={<DonateConfirm />} />
                  <Route path="/dashboard-stat" element={<DashboardStatic />} />
                  <Route path="/dashboard-activity" element={<DashboardActivitiesPage />} />
                  <Route path="/dashboard-donation" element={<DashboardDonationPage />} />
                  <Route path="/dashboard-project" element={<DashboardProjectsPage />} />
                  <Route path="/dashboard-alumni" element={<DashboardAlumniPage />} />
                  <Route path="/donate/donate-general" element={<DonationGeneral />} />
                  <Route path="/donate/donation-summary-detail/project" element={<DonationSummaryDetail />} />
                  <Route path="/donate/donation-summary-detail/general" element={<DonationSummaryDetail />} />
                  <Route path="/donate/donation-summary-detail/all" element={<DonationSummaryDetail />} />
                  <Route path="/donate/donation-summary-detail" element={<DonationSummaryDetail />} />
                  <Route path="/donate/donation-all" element={<DonationAll />} />
        
                  {/* ลองทำไว้ก่อน */}
                  <Route path="/change-password" element={<ChangePassword />} />

                  {/* route ของศิษย์เก่า */}
                  <Route path="/alumni-home" element={<AlumniOnly><AlumniHome /></AlumniOnly>} />
                  <Route path="/alumni-favorite" element={<WebboardFavorite />} />
                  <Route path="/alumni-profile/alumni-profile-webboard" element={<AlumniOnly><AlumniProfileWebboard /></AlumniOnly>} />
                  <Route path="/alumni-profile/alumni-profile-webboard/edit-webboard/:webboardId" element={<AlumniOnly><EditWebboard /></AlumniOnly>} />
                  <Route path="/alumni-profile/alumni-profile-activity" element={<AlumniOnly><AlumniProfileActivity /></AlumniOnly>} />
                  <Route path="/alumni-profile/alumni-profile-souvenir" element={<AlumniOnly><AlumniProfileSouvenir /></AlumniOnly>} />
                  <Route path="/alumni-profile" element={<AlumniOnly><Profile /></AlumniOnly>} />
                  <Route path="/alumni-profile/alumni-request" element={<AlumniOnly><AlumniProfileRequest /></AlumniOnly>} />
                  <Route path="/alumni-profile/alumni-profile-donation" element={<AlumniOnly><AlumniProfileDonation /></AlumniOnly>} />
                  <Route path="/alumni-profile/alumni-manage-orders" element={<AlumniOnly><AlumniManageOrders /></AlumniOnly>} />

                  {/* route ของศิษย์ปัจจุบัน */}
                  <Route path="/student-profile" element={<StudentOnly><StudentProfile /></StudentOnly>} />
                  <Route path="/student-profile/student-profile-webboard" element={<StudentOnly><StudentProfileWebboard /></StudentOnly>} />
                  <Route path="/student-profile/student-profile-activity" element={<StudentOnly><StudentProfileActivity /></StudentOnly>} />
                  <Route path="/student-profile/student-profile-souvenir" element={<StudentOnly><StudentProfileSouvenir /></StudentOnly>} />
                  <Route path="/student-home" element={<StudentOnly><StudentHome /></StudentOnly>} />
                  <Route path="/student-profile/student-profile-webboard/edit-webboard/:webboardId" element={<StudentOnly><StudentEditWebboard /></StudentOnly>} />
                  <Route path="/student-profile/student-profile-webboard/edit-webboard" element={<StudentOnly><StudentEditWebboard /></StudentOnly>} />
                  <Route path="/student-profile/student-request" element={<StudentOnly><StudentProfileRequest /></StudentOnly>} />
                  <Route path="/student-profile/student-profile-donation" element={<StudentOnly><StudentProfileDonation /></StudentOnly>} />
                  <Route path="/student-profile/student-manage-orders" element={<StudentOnly><StudentManageOrders /></StudentOnly>} />

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
                  <Route path="/president-profile/president-profile-donation" element={<PresidentOnly><PresidentProfileDonation /></PresidentOnly>} />
                  <Route path="/president-profile/president-manage-orders" element={<PresidentOnly><PresidentManageOrders /></PresidentOnly>} />
                  <Route path="/president-profile/president-summary-all" element={<PresidentOnly><PresidentSummaryAll /></PresidentOnly>} />
                  <Route path="/president-profile/president-orderlist" element={<PresidentOnly><PresidentOrdersList /></PresidentOnly>} />
                </Route>

                {/* route ของแอดมิน */}
                <Route element={<Admin />}>
                  <Route path="/admin-home" element={<AdminOnly><AdminHome /></AdminOnly>} />
                  <Route path="/admin/souvenir" element={<AdminOnly><AdminSouvenir /></AdminOnly>} />
                  <Route path="/admin/activities" element={<AdminOnly><AdminActivity /></AdminOnly>} />
                  <Route path="/admin/activities/admin-create-activity" element={<AdminOnly><CreateActivity /></AdminOnly>} />
                  <Route path="/admin/activities/:activityId" element={<AdminOnly><AdminActivityDetail /></AdminOnly>} />
                  <Route path="/admin/souvenir/souvenir_request" element={<AdminOnly><SouvenirRequest /></AdminOnly>} />
                  <Route path="/admin/verify" element={<AdminOnly><AdminVerifySlip /></AdminOnly>} />
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
                  <Route path="/admin-home/dashboard-alumni/:userId" element={<AdminOnly><UserProfile /></AdminOnly>} />
                  {/* <Route path="/admin-home/dashboard-alumni/edit-user-profile/:userId" element={<AdminOnly><EditUserProfile /></AdminOnly>} /> */}
                  <Route path="/admin/admin-alumni" element={<AdminOnly><AdminAlumni /></AdminOnly>} />
                  <Route path="/admin/admin-alumni/admin-alumniView/:major" element={<AdminOnly><AdminAlumniView /></AdminOnly>} />
                  <Route path="/admin/donations" element={<AdminOnly><AdminDonate /></AdminOnly>} />
                  <Route path="/admin/souvenir/admin-manage-orders" element={<AdminOnly><AdminOrderManager /></AdminOnly>} />
                  <Route path="/admin/donations/check-payment-donate/detail/:id" element={<AdminOnly><AdminCheckPaymentDonateDetail /></AdminOnly>} />
                  <Route path="/admin/donations/edit/:id" element={<AdminOnly><AdminEditProject /></AdminOnly>} />
                  <Route path="/admin/donations/donate-request" element={<AdminOnly><AdminDonateRequest /></AdminOnly>} />
                  <Route path="/admin/donations/donate-detail/:id" element={<AdminOnly><AdminProjectDetail /></AdminOnly>} />
                  <Route path="/admin/users/add-user" element={<AdminOnly><AddUser /></AdminOnly>} />
                  <Route path="/admin/souvenir/product-slot/:productId" element={<AdminOnly><ProductSlots /></AdminOnly>} />
                  <Route path="/admin-home/dashboard-activity" element={<AdminOnly><AdminDashboardActivitiesPages /></AdminOnly>} />
                  <Route path="/admin-home/dashboard-project" element={<AdminOnly><AdminDashboarsProjectsPage /></AdminOnly>} />
                  <Route path="/admin-home/dashboard-donation" element={<AdminOnly><AdminDashboardDonationsPage /></AdminOnly>} />
                  <Route path="/admin-home/dashboard-alumni" element={<AdminOnly><AdminDashboardAlumniPage /></AdminOnly>} />
                  <Route path="/admin/donations/donation-list" element={<AdminOnly><AdminDonationLists /></AdminOnly>} />
                  <Route path="/admin/donations/walkin-donation" element={<AdminOnly><WalkInDonationForm /></AdminOnly>} />
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        {/* </UserProvider> */}
      </BrowserRouter>
  );
}

export default App;
