import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet, useLocation } from "react-router-dom";


function AppLayout() {
     const location = useLocation();

     const hideHeaderPaths = ["/login","/register"];
     const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
     const shouldHideFooter = hideHeaderPaths.includes(location.pathname);

  return (
    <div>
    
      {!shouldHideHeader && <Header />} 

        <main className="main-content">
          <Outlet />
        </main>

        {!shouldHideFooter && <Footer />}
      </div>

     
  );
}

export default AppLayout;