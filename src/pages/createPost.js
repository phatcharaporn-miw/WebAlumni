import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";
import Swal from "sweetalert2";

function CreatePost() {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState(null);
    const [content, setContent] = useState('');
    const [startDate, setStartDate] = useState('');
    const [category, setCategory] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [banWords, setBanWords] = useState('');
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือยัง
    useEffect(() => {
        const userSession = localStorage.getItem("userId");
        if (!userSession) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนถึงจะสร้างกระทู้ได้",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ",
            }).then(() => {
                navigate("/login");
            });
        } else {
            setIsLoggedin(true);
        }
    }, [navigate]);

    // ดึงcategory
    useEffect(() => {
        axios.get(`http://localhost:3001/category/category-all`)
            .then(response => {
                if (response.data.success) {
                    setCategory(response.data.data);
                } else {
                    console.error('เกิดข้อผิดพลาดในการดึงหมวดหมู่:', response.data.message);
                }
            })
            .catch(error => {
                console.error('เกิดข้อผิดพลาดในการดึงหมวดหมู่:', error.message);
            });
    }, []);


    // เพิ่มหมวดหมู่ใหม่
    const addCategory = () => {
        // ถ้าไม่ได้กรอก ให้ return ออกไป
        if (!newCategory.trim()) {
            alert("กรุณากรอกชื่อหมวดหมู่");
            return;
        }

        axios.post('http://localhost:3001/category/add-category', { category_name: newCategory }, {
            withCredentials: true
        })
            .then(response => {
                if (response.data.success) {
                    console.log('เพิ่มหมวดหมู่ใหม่สำเร็จ:', response.data);
                    const addedCategory = {
                        category_id: response.data.data.category_id,
                        category_name: newCategory
                    };
                    setCategory([...category, addedCategory]);
                    setCategoryId(addedCategory.category_id); // อัปเดต categoryId ทันที
                    setNewCategory('');
                    setShowNewCategoryInput(false);
                } else {
                    console.error('เพิ่มหมวดหมู่ใหม่ไม่สำเร็จ:', response.data.message);
                }
            })
            .catch(error => {
                console.error('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่:', error.message);
            });
    };

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
        setCategoryId(selectedValue);

        if (selectedValue === "add_new") {
            setShowNewCategoryInput(true);
        } else {
            setShowNewCategoryInput(false);
        }
    };

    const handleFileChange = (event) => {
        setImage(event.target.files[0]); // อัปโหลดไฟล์ภาพ
    };

    // คำต้องห้าม
    const bannedWords = [
        "ควย", "สัส", "เหี้ย", "ห่า", "ไอ้สัตว์", "ไอ้เวร", "อีดอก", "อีเหี้ย",
        "เย็ด", "เชี่ย", "สัด", "ตอแหล", "สถุน", "อีสัตว์", "อีเวร", "อีควาย", "อีสัส"
    ];

    const handleContentChange = (e) => {
        const value = e.target.value;
        const regex = new RegExp(bannedWords.join("|"), "i");
        if (regex.test(value)) {
            const found = bannedWords.find(word => value.includes(word));
            setError(`เนื้อหามีคำต้องห้าม: ${found}`);
            Swal.fire({
                title: "พบคำต้องห้าม",
                text: `เนื้อหาของคุณมีคำต้องห้าม กรุณาลบคำต้องห้าม`,
                icon: "warning"
            });
            return; // ไม่เปลี่ยนค่า content
        }
        setError("");
        setContent(value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // ตรวจสอบคำต้องห้าม
        const regex = new RegExp(bannedWords.join("|"), "i"); // ใช้ RegExp เพื่อรองรับการค้นหาคำต้องห้ามไม่สนใจตัวพิมพ์เล็ก-ใหญ่
        if (regex.test(content)) {
            const bannedWord = bannedWords.find(word => content.includes(word));
            setError(`เนื้อหาของกระทู้มีคำที่ต้องห้าม: ${bannedWord}`);
            Swal.fire({
                title: "ไม่สามารถสร้างกระทู้ได้",
                text: `เนื้อหาของคุณมีคำต้องห้าม กรุณาลบคำต้องห้าม`,
                icon: "warning"
            });
            return;
        }

        // ตรวจสอบว่า categoryId เป็นค่าที่ถูกต้อง
        let categoryToSend = categoryId;
        if (newCategory) {
            await addCategory(); // รอให้เพิ่มหมวดหมู่ใหม่
            categoryToSend = category.find(c => c.category_name === newCategory)?.category_id;
        }
        // console.log("categoryToSend:", categoryToSend); 

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category_id', categoryToSend);
        formData.append('content', content);
        formData.append('startDate', startDate);
        formData.append('image', image);

        axios.post('http://localhost:3001/web/create-post', formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        })
            .then((response) => {
                if (response.status === 200) {
                    Swal.fire({
                        title: 'สร้างกระทู้เรียบร้อยแล้ว!',
                        icon: 'success',
                        confirmButtonText: 'ไปยังกระทู้'
                    }).then(() => {
                        navigate("/webboard");
                    });
                } else {
                    Swal.fire('เกิดข้อผิดพลาดในการสร้างกระทู้');
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการสร้างกระทู้:', error.message);
            });
    };

    return (
        <section className="createPost-page">
            <div className="container">
                <h3 className="webboard-title">สร้างกระทู้ใหม่</h3>
                <div className="form-create-post shadow p-4 bg-white rounded mb-5" style={{ maxWidth: "80%", margin: "0 auto" }}>
                    <form onSubmit={handleSubmit}>
                        <fieldset>
                            <div className="form-group mb-3">
                                <label>หัวข้อกระทู้ <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="หัวข้อกระทู้"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>รายละเอียดกระทู้ <span className="text-danger">*</span></label>
                                <textarea
                                    className="form-control"
                                    placeholder="เนื้อหากระทู้"
                                    value={content}
                                    onChange={handleContentChange}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>อัปโหลดรูปภาพประกอบ (ถ้ามี)</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>วันที่สร้างกระทู้ <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group mb-3">
                                <label>เลือกหมวดหมู่ <span className="text-danger">*</span></label>
                                <select
                                    className="form-control"
                                    value={categoryId}
                                    onChange={handleCategoryChange}
                                    required
                                >
                                    <option value="">เลือกหมวดหมู่</option>
                                    {Array.isArray(category) && category.length > 0 ? (
                                        category.map(category => (
                                            <option key={category.category_id} value={category.category_id}>
                                                {category.category_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>ไม่มีหมวดหมู่</option>
                                    )}
                                    <option value="add_new">เพิ่มหมวดหมู่...</option>
                                </select>
                            </div>

                            {/* แสดงฟอร์มเพิ่มหมวดหมู่ใหม่เมื่อเลือก "เพิ่มหมวดหมู่" */}
                            {categoryId === "add_new" && (
                                <div className="form-group mb-3 d-flex align-items-center">
                                    <input
                                        type="text"
                                        className="form-control me-2"
                                        placeholder="กรอกชื่อหมวดหมู่"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <button type="button" className="btn btn-success" onClick={addCategory}>
                                        <IoIosAdd /> เพิ่ม
                                    </button>
                                </div>
                            )}


                            <div className="form-group">
                                <button type="submit" className="btn btn-primary w-100 mt-3">
                                    สร้างกระทู้
                                </button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default CreatePost;