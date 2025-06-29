// 

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import "../css/appLayout.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from './Breadcrumb';
import { useAuth } from '../context/AuthContext';

function AppLayout() {
    const { user, setUser, notifications, handleLogin, handleLogout, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const hideHeaderPaths = ["/login", "/register", "/forgotPassword"];
    const shouldHideHeader = hideHeaderPaths.includes(location.pathname);
    const shouldHideFooter = hideHeaderPaths.includes(location.pathname);

    // เพิ่ม loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">กำลังโหลด...</div>
            </div>
        );
    }

    // สร้าง logout function ที่มี navigation
    const handleLogoutWithNav = async () => {
        const success = await handleLogout();
        if (success) {
            navigate('/');
        }
    };

    return (
        <div id="root">
            {!shouldHideHeader && (
                <Header
                    user={user}
                    setUser={setUser}
                    notifications={notifications}
                    handleLogin={handleLogin}
                />
            )}

            <main className="main-content">
                <Breadcrumb />
                <Outlet context={{ 
                    user, 
                    setUser, 
                    handleLogin, 
                    handleLogout: handleLogoutWithNav 
                }} />
            </main>

            {!shouldHideFooter && <Footer />}
        </div>   
    );
}

export default AppLayout;