import React, { useState } from "react";
import "../css/Header.css";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { SlMagnifier } from "react-icons/sl";
import { SlArrowDown } from "react-icons/sl";


function Header() {
  const [searchTerm, setSearchTerm] = useState("");

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
        <img className="logo" src="/image/logoCP.png" alt="College of Computing Logo"/>

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

          <button className="login-btn m-2 ms-5">เข้าสู่ระบบ</button>
        </div>
      </div>

      <nav>
        <ul className="nav">
          <li className="nav-item"><a href="/" className="nav-link" activeClassName="active-link">หน้าหลัก</a></li>
          <li className="nav-item"><a href="/about" className="nav-link">เกี่ยวกับ</a></li>          
            <li className="dropdown">
            <li className="dropbtn">ประชาสัมพันธ์</li>
            <SlArrowDown className="arrow-down"/>
            <div className="dropdown-content">
                <a href="/news">ประชาสัมพันธ์</a>
                <a href="/activity">กิจกรรม</a>
            </div>
            </li>
          <li className="nav-item"><a href="/donate" className="nav-link">บริจาค</a></li>
          <li className="nav-item"><a href="/alumni" className="nav-link">ทำเนียบศิษย์เก่า</a></li>
          <li className="nav-item"><a href="/souvenir" className="nav-link">ของที่ระลึก</a></li>
          <li className="nav-item"><a href="/webboard" className="nav-link">เว็บบอร์ด</a></li>
        </ul>
      </nav>
    </header>

    
  );
}

export default Header;
