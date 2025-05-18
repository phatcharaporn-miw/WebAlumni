import React from "react";
import "../css/Footer.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { NavLink } from "react-router-dom";
import { IoMdPin } from "react-icons/io";
import { IoMdCall } from "react-icons/io";

function Footer(){

    return(
       <footer className="footer">
        <div className="container ">
            <div className="row g-3">
                <div className="col-md-3 ">
                <img className="footer-logo" src="/image/logoCP1.png" alt="College of Computing Logo"/>
                <p id="foot-text" className="text-start "> 
                สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่นก่อตั้งขึ้นเพื่อเสริมสร้างเครือข่ายและความร่วมมือระหว่างศิษย์เก่า ศิษย์ปัจจุบัน และคณาจารย์ 
                รวมถึงสนับสนุนการพัฒนาด้านเทคโนโลยีสารสนเทศ ส่งเสริมโอกาสทางอาชีพ และให้การสนับสนุนแก่ศิษย์ปัจจุบันในการศึกษาวิจัยและนวัตกรรม
                </p>
                </div>
                <div className="col-md-3 ">
                    <h4>ข่าวสาร</h4>
                    <NavLink to="/news" className="foot-news">
                        ประชาสัมพันธ์
                    </NavLink>
                    <NavLink to="/activity" className="foot-act">
                        กิจกรรมของสมาคม
                    </NavLink>
                    <NavLink to="/donate" className="foot-donate">
                        บริจาค
                    </NavLink>
                </div>
                <div className="col-md-3">
                    <h4>ช่องทางการติดต่อ</h4>
                    <div className="footer-contact">
                        <IoMdPin className="footer-icon" />
                        <p>วิทยาลัยการคอมพิวเตอร์</p> 
                    </div>
                    <div className="footer-contact2">
                        <p>123 ถ.มิตรภาพ ต.ในเมือง </p>
                     
                    </div>
                    <div className="footer-contact3">
                        <p>อ.เมือง จ.ขอนแก่น 40002</p>
                    </div>
                    <div className="footer-contact">
                        <IoMdCall className="footer-icon" />
                        <p>044-870000</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <h4>FAQ</h4>
                    <NavLink to="/faq" className="foot-faq">
                        คำถามที่พบบ่อย
                    </NavLink>
                </div>
            </div>
            
        </div>
        <div className="footer-bottom">
            <p>College of Computing</p>
        </div>
       </footer>

       
    )
}

export default Footer;