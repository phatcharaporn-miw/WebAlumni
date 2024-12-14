import React from "react";
import "../css/Donate.css"

function Donate() {
    return (
        <div className="head-donate" >
            <img src="./image/donation.jpg" alt="dodation-image" />
            <button className="donate-button">บริจาค</button>

            <div>
                <div className="donate-type">
                    <button className="donate-type-items-all">โครงการบริจาคทั้งหมด</button>
                    <button className="donate-type-items">บริจาคแบบระดมทุน</button>
                    <button className="donate-type-items">บริจาคแบบไม่จำกัดจำนวน</button>
                    <button className="donate-type-items">เพิ่มโครงการบริจาค</button>
                </div>
            </div>

        </div>
    )
}

export default Donate;