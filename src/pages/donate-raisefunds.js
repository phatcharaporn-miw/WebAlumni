import React from "react";
import "../css/Donate-raise.css";
import { Link } from 'react-router-dom';

function DonateRaise(){
    const currentAmount = 3000; // ยอดบริจาคปัจจุบัน
    const goalAmount = 10000; // เป้าหมาย
    const progress = (currentAmount / goalAmount) * 100; // คำนวณเปอร์เซ็นต์

    return (
        <div>
            <img src="./image/donation.jpg" className="head-donate" alt="donation-image" />
            <button className="donate-button">บริจาค</button>

            {/* ปุ่มประเภทบริจาค */}
            <div>
                <div className="donate-type">
                    <Link to="/donate"><button className="donate-type-items">โครงการบริจาคทั้งหมด</button></Link>
                    <button className="donate-type-items-raise">บริจาคแบบระดมทุน</button>
                    <Link to="/donatunlimit"><button className="donate-type-items">บริจาคแบบไม่จำกัดจำนวน</button></Link>
                    <button className="donate-type-items">เพิ่มโครงการบริจาค</button>
                </div>

                {/* รายการบริจาค */}
                <div className="donate-content">
                    <h3>บริจาคแบบระดมทุน</h3>
                    <div className="donate-content-item">
                        <div className="item-detail">
                            <div className="image-frame">
                                <img src="./image/activitie1.jpg" alt="Avatar" />
                            </div>
                            <div className="donate-discription">
                                <h5><b>ยิ้มสู่ชุมชน</b></h5>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                            </div>
                            {/* Progress Bar */}
                                <div className="progress">{`${progress}%`}</div>
                            <div className="bar">
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                            </div>
                            </div>

                            <div className="donate-details">
                                <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                                <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                            </div>
                            <button className="donate-bt">บริจาค</button>
                        </div>

                        <div className="item-detail">
                            <div className="image-frame">
                                <img src="./image/activitie2.jpg" alt="Avatar" />
                            </div>
                            <div className="donate-discription">
                                <h5><b>ยิ้มสู่ชุมชน</b></h5>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                            </div>
                            {/* Progress Bar */}
                                <div className="progress">{`${progress}%`}</div>
                            <div className="bar">
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                            </div>
                            </div>

                            <div className="donate-details">
                                <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                                <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                            </div>
                            <button className="donate-bt">บริจาค</button>
                        </div>
                        <div className="item-detail">
                            <div className="image-frame">
                                <img src="./image/กิจกรรม1.png" alt="Avatar" />
                            </div>
                            <div className="donate-discription">
                                <h5><b>ยิ้มสู่ชุมชน</b></h5>
                                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry...</p>
                            </div>
                            {/* Progress Bar */}
                                <div className="progress">{`${progress}%`}</div>
                            <div className="bar">
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                                <span className="progress-percent">{`${progress.toFixed(0)}%`}</span>
                            </div>
                            </div>

                            <div className="donate-details">
                                <span>ยอดบริจาคปัจจุบัน: {currentAmount.toLocaleString()} บาท</span>
                                <span>เป้าหมาย: {goalAmount.toLocaleString()} บาท</span>
                            </div>
                            <button className="donate-bt">บริจาค</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DonateRaise;
