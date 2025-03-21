import React from "react";
import axios from "axios";

function Testpage() {
    // ฟังก์ชันที่ใช้ดึงข้อมูลจาก API
    async function test() {
        try {
            const res = await axios.get('http://localhost:5000/test/test');  // ใช้ await เพื่อรอผลลัพธ์
            console.log(res.data);  // แสดงผลลัพธ์ที่ได้จาก API
        } catch (error) {
            console.error("There was an error!", error); 
        }
    }
    return (
        <>
            <button onClick={test}>
                Show Data
            </button>
        </>
    );
}

export default Testpage;
