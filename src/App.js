//import logo from './logo.svg';
import './App.css';
import React from 'react';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./pages/home";
import About from "./pages/about";
import News from './pages/news';
import Activity from './pages/activity';
import Donate from './pages/donate';
import Souvenir from './pages/souvenir';
import Webboard from './pages/webboard';
import Alumni from './pages/alumni';


function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="news" element={<News />} />
      <Route path="activity" element={<Activity />} />
      <Route path="donate" element={<Donate />} />
      <Route path="alumni" element={<Alumni />} />
      <Route path="souvenir" element={<Souvenir />} />
      <Route path="webboard" element={<Webboard />} />
      
    </Route>
    </Routes>
  </BrowserRouter>
  );
}

export default App;
