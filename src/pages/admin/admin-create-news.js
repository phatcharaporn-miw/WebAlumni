import React, {useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

function CreateNews(){
    const [title, setTitle] = useState('');
    const [image, setImage] = useState(null);
    const [content, setContent] = useState('');
    const [created_at, setCreated_at] = useState('');
    // const [role_posted, setRole_Posted] = useState('');    
    const navigate = useNavigate();

    // // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
    // useEffect(() => {
    //     const userSession = localStorage.getItem("userId"); 
    //    //console.log("userId จาก localStorage:", userSession); // เช็คค่า userId

    //     if (!userSession) {
    //     alert("กรุณาเข้าสู่ระบบก่อนสร้างกระทู้");
    //     navigate("/login"); 
    //     } else{
    //         setIsLoggedin(true);
    //     }
    // }, [navigate]);

    const handleFileChange = (event) => {
        setImage(event.target.files[0]); // อัปโหลดไฟล์ภาพ
      };

    const handleSubmit = async (event) => {
        event.preventDefault();
      
      
    const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('image', image);

      axios.post('http://localhost:3001/news/create-news', formData, {
                withCredentials: true, 
                headers: { "Content-Type": "multipart/form-data" }
              })
                .then((response) => {
                  console.log("API Response:", response.data);
                  if (response.status === 200) {
                      alert('โพสต์ข่าวประชาสัมพันธ์เรียบร้อยแล้ว!');
                      navigate("/news");
                  }else{
                      alert('เกิดข้อผิดพลาดในการโพสต์ข่าวประชาสัมพันธ์');
                  }
                })
                .catch((error) => {
                  console.error('เกิดข้อผิดพลาดในการโพสต์ข่าวประชาสัมพันธ์:', error.message);
                });
    };    

    return(
        <section className="create-news">
            <div className="create-news-page">
                <h3 className="create-news-title">เพิ่มข่าวประชาสัมพันธ์</h3>
                <div className="form-create-news">
                <form onSubmit={handleSubmit}>
                    <fieldset>
                               
                                <div className="form-group">
                                    <label>หัวข้อข่าว<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="title" name="title" placeholder='หัวข้อกระทู้'
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>เนื้อหาข่าวประชาสัมพันธ์<span className="importent">*</span></label>
                                     <textarea type="text" className="form-control" id="content" name="content" placeholder='เนื้อหากระทู้'
                                      value={content} 
                                      onChange={(e) => setContent(e.target.value)} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>อัปโหลดรูปภาพประกอบ (ถ้ามี) </label>
                                    <input type="file" className="form-control" id="image_path" name="image_path" 
                                    onChange={handleFileChange}
                                    
                                    />
                                </div>


                                {/* <div className="form-group">
                                    <label>เลือกหมวดหมู่<span className="importent">*</span></label>
                                    <input type="text" className="form-control" id="startDate" name="startDate" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    />
                                </div> */}
                        
                        <div className="form-group">
                            <button type="submit" className="btn btn-primary w-100 mt-3">
                                โพสต์ข่าว
                            </button>
                        </div>

                    </fieldset>
                </form>
                </div>
            </div>
        </section>
        
    )
}

export default CreateNews;