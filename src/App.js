import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Testpage from './pages/test';

function App() {
  return (
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path='/test' element={<Testpage />} />
          <Route path="/admindonate" element={<AdminDonate />} />
        </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
