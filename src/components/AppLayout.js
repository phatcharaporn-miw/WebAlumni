// src/components/AppLayout.js
import React from 'react';
import Header from './Header';
import { Outlet, useLocation } from "react-router-dom";


function AppLayout() {
    // const location = useLocation();

  return (
    <div>
      {/* Header จะแสดงเหมือนกันทุกหน้า */}
      <Header />

      {/* <nav aria-label="breadcrumb" className="container mt-2">
        <ul className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">หน้าหลัก</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {location.pathname.replace("/", "") || "หน้าปัจจุบัน"}
          </li>
        </ul>
      </nav> */}

        <main className="main-content">
          <Outlet />
        </main>

      </div>

     
  );
}

export default AppLayout;
