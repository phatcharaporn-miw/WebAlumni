import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from "react-router-dom";


function AppLayout() {
     const location = useLocation();

     const hideHeaderPaths = ["/login","register"];
     const shouldHideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div>
      {/* Header จะแสดงเหมือนกันทุกหน้า */}
      { <Header />} 

        <main className="main-content">
          <Outlet />
        </main>

        { <Footer />}
      </div>

     
  );
}

export default AppLayout;