import React, { useState, useEffect } from "react";
import "../css/Header.css";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { SlMagnifier } from "react-icons/sl";
import { SlArrowDown } from "react-icons/sl";
import {  NavLink } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";

function Header({user, notifications}) {
  const [searchTerm, setSearchTerm] = useState("");


  // console.log("User in Header:", user);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    console.log("Search Term:", searchTerm);
  };

  return (
    <header className="header">
      {/* โลโก้ และช่องค้นหา */}
      <div className="header-top">
        {/* โลโก้ */}
        <img className="logo" src="/image/logoCP1.png" alt="College of Computing Logo"/>

        {/* ช่องค้นหาและปุ่มเข้าสู่ระบบ */}
        <div className="search-and-login">
          <div className="search ">
            <input 
              type="text" 
              value={searchTerm} 
              onChange={handleSearchChange} 
              className="form-control" 
            />
            <button onClick={handleSearchClick} className="search-icon-btn">
              <SlMagnifier className="search-icon" />
            </button>
          </div>

           {/* หากผู้ใช้เข้าสู่ระบบแล้วจะแสดงโปรไฟล์และแจ้งเตือน */}
           {user ? (
            <div className="user-profile">
              <div className="notification-icon">
              <IoMdNotificationsOutline />
              </div>
              
              <NavLink to="/alumni-profile">
                <img src={`${user.profilePicture}` || "/profile-picture.png"} alt="User Profile" className="profile-img" 
                style={{ cursor: "pointer" }}/>
              </NavLink>
              
            </div>
          ) : (
            <NavLink to="/login">
              <button className="login-btn m-2 ms-5">เข้าสู่ระบบ</button>
            </NavLink>
          )}

        </div>
      </div>

      <nav>
        <ul className="nav">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              หน้าหลัก
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/about" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              เกี่ยวกับ
            </NavLink>
          </li>          
          <li className="dropdown">
            <div className="dropbtn">ประชาสัมพันธ์</div>
            <SlArrowDown className="arrow-down"/>
            <div className="dropdown-content">
              <NavLink 
                to="/news" 
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                ประชาสัมพันธ์
              </NavLink>
              <NavLink 
                to="/activity" 
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                กิจกรรม
              </NavLink>
            </div>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/donate" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              บริจาค
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/alumni" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              ทำเนียบศิษย์เก่า
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/souvenir" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              ของที่ระลึก
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/webboard" 
              className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
            >
              เว็บบอร์ด
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>

    
  );
}

export default Header;
