import React from "react";
import "../css/Footer.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink } from "react-router-dom";
import { IoMdPin, IoMdCall } from "react-icons/io";



function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div className="col">
            <img
              className="footer-logo mb-3"
              src="/image/logoCP1.png"
              alt="College of Computing Logo"
              loading="lazy"
              width="260"
              height="130"
            />
            <p className="text-start" id="foot-text">
              สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่นก่อตั้งขึ้นเพื่อเสริมสร้างเครือข่ายและความร่วมมือระหว่างศิษย์เก่า ศิษย์ปัจจุบัน และคณาจารย์
              รวมถึงสนับสนุนการพัฒนาด้านเทคโนโลยีสารสนเทศ ส่งเสริมโอกาสทางอาชีพ และให้การสนับสนุนแก่ศิษย์ปัจจุบันในการศึกษาวิจัยและนวัตกรรม
            </p>
          </div>

          <div className="col">
            <h4>ข่าวสาร</h4>
            <NavLink to="/news" className="d-block foot-news">ประชาสัมพันธ์</NavLink>
            <NavLink to="/activity" className="d-block foot-act">กิจกรรมของสมาคม</NavLink>
            <NavLink to="/donate" className="d-block foot-donate">บริจาค</NavLink>
          </div>

          <div className="col">
            <h4>ช่องทางการติดต่อ</h4>
            <div className="footer-contact d-flex align-items-start">
              <IoMdPin className="footer-icon me-2 mt-1" />
              <p className="mb-0">วิทยาลัยการคอมพิวเตอร์</p>
            </div>
            <div className="footer-contact2">
              <p className="mb-0">123 ถ.มิตรภาพ ต.ในเมือง</p>
            </div>
            <div className="footer-contact3">
              <p>อ.เมือง จ.ขอนแก่น 40002</p>
            </div>
            <div className="footer-contact d-flex align-items-start">
              <IoMdCall className="footer-icon me-2 mt-1" />
              <p className="mb-0">044-870000</p>
            </div>
          </div>

          <div className="col">
            <h4>FAQ</h4>
            <NavLink to="/faq" className="d-block foot-faq">คำถามที่พบบ่อย</NavLink>
          </div>
        </div>
      </div>

      <div className="footer-bottom text-center mt-4">
        <p className="mb-0">© 2025 College of Computing</p>
      </div>
    </footer>
  );
}

export default Footer;
