import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { HOSTNAME } from "../../config";
import { useOutletContext } from "react-router-dom";
import {
    FaChevronLeft,
    FaCoins,
    FaUsers,
    FaProjectDiagram,
    FaShoppingCart,
    FaChartLine,
    FaUserGraduate
} from "react-icons/fa";
import "../../css/DonationSummaryDetail.css";

function PresidentSummaryAll() {
    const [profile, setProfile] = useState({
        degrees: [],
        educations: [],
    })
    const navigate = useNavigate();
    const [major, setMajor] = useState([]);
    const [loading, setLoading] = useState(true);
    const { handleLogout } = useOutletContext();
    const [loginInfo, setLoginInfo] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // สำหรับซ่อน/แสดงรหัสผ่าน
    const [previewImage, setPreviewImage] = useState(null);
    // State สำหรับข้อมูลต่างๆ
    const [alumniData, setAlumniData] = useState([]);
    const [donations, setDonations] = useState([]);
    const [products, setProducts] = useState([]);
    const [statistics, setStatistics] = useState({
        totalAlumni: 0,
        totalDonations: 0,
        totalDonationAmount: 0,
        totalOrders: 0,
        totalOrderAmount: 0,
        projectDonations: 0,
        generalDonations: 0,
        pendingOrders: 0,
        completedOrders: 0
    });
    const [editing, setEditing] = useState(false); //สลับโหมดการแก้ไข

    useEffect(() => {
        axios.get(HOSTNAME + '/users/profile', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });

        axios.get(HOSTNAME + '/add/major', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setMajor(response.data.major);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูล major:', error.message);
            });

        axios.get(HOSTNAME + '/users/login-info', { withCredentials: true })
            .then((response) => {
                if (response.data.success) {
                    setLoginInfo(response.data.loginInfo);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูล login:', error.message);
            });
    }, []);

    useEffect(() => {
        axios.get(`${HOSTNAME}/api/alumni-all`)
            .then((res) => {
                const data = Array.isArray(res.data.data) ? res.data.data : [];
                setAlumniData(data);
                setStatistics(prev => ({ ...prev, totalAlumni: data.length }));
            })
            .catch((err) => console.error("โหลดข้อมูลศิษย์เก่าไม่สำเร็จ:", err));
    }, []);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const res = await axios.get(`${HOSTNAME}/donate/donation-summary-details`, {
                    params: { type: 'all' }
                });
                const safeData = res.data.map(item => ({
                    donation_id: item.donation_id,
                    project_name: item.project_name || null,
                    full_name: item.full_name || "ผู้บริจาคไม่ประสงค์ออกนาม",
                    profile_image: item.image_path || null,
                    amount: parseFloat(item.amount),
                    payment_status: item.payment_status,
                    donation_date: item.donation_date,
                    note: item.note || "",
                    transaction_id: item.transaction_id || ""
                }));

                setDonations(safeData);

                const totalAmount = safeData.reduce((sum, d) => sum + d.amount, 0);
                const projectCount = safeData.filter(d => d.project_name).length;
                const generalCount = safeData.filter(d => !d.project_name).length;

                setStatistics(prev => ({
                    ...prev,
                    totalDonations: safeData.length,
                    totalDonationAmount: totalAmount,
                    projectDonations: projectCount,
                    generalDonations: generalCount
                }));
            } catch (err) {
                console.error("โหลดข้อมูลการบริจาคไม่สำเร็จ:", err);
            }
        };
        fetchDonations();
    }, []);

    useEffect(() => {
    axios.get(`${HOSTNAME}/souvenir/summary-all`, { withCredentials: true })
        .then((response) => {
            const productData = response.data.data || [];
            setProducts(productData);
            console.log(response.data)

            const totalOrders = productData.length; // จำนวนสินค้าที่มียอดขาย
            const totalAmount = productData.reduce((sum, p) => sum + (parseFloat(p.total_sales_amount) || 0), 0);
            const totalSold = productData.reduce((sum, p) => sum + (parseInt(p.total_sold_quantity) || 0), 0);

            setStatistics(prev => ({
                ...prev,
                totalOrders: totalOrders,            // จำนวนสินค้า
                totalOrderAmount: totalAmount,       // ยอดขายรวมทั้งหมด
                completedOrders: totalSold           // จำนวนสินค้าทั้งหมดที่ขายออก
            }));
        })
        .catch((error) => console.error("เกิดข้อผิดพลาดในการดึงข้อมูลยอดขายสินค้า:", error))
        .finally(() => setLoading(false));
}, []);



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleClick = (path) => {
        navigate(path);
    };

    //แปลงวันที่
    const formatBirthday = (dbDate) => {
        if (!dbDate) return '';
        const date = new Date(dbDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); //ทำให้เดือนมีความยาว 2 ตัวอักษรเสมอ 
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const degrees = Array.isArray(profile.degrees) ? profile.degrees : [];

    // อัปเดตค่าใน State เมื่อแก้ไขฟอร์ม
    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // อัปเดตค่าใน educations
    const handleEducationChange = (index, field, value) => {
        const updatedEducations = [...profile.educations];
        updatedEducations[index][field] = value;
        setProfile((prevState) => ({
            ...prevState,
            educations: updatedEducations,
        }));
    };

    const addEducation = () => {
        setProfile((prevState) => ({
            ...prevState,
            educations: [...prevState.educations, {
                degree_id: '',
                major_id: '',
                studentId: '',
                graduation_year: ''
            }],
        }));
    };


    const removeEducation = (index) => {
        const updatedEducations = [...profile.educations];
        updatedEducations.splice(index, 1);
        setProfile((prevState) => ({ ...prevState, educations: updatedEducations }));
    };

    // แก้ไขข้อมูลส่วนตัว
    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = () => {
        const updatedProfile = { ...profile };
        // console.log('ข้อมูลที่ส่งไป Backend:',  updatedProfile); // ตรวจสอบค่า
        axios.post(HOSTNAME + '/users/edit-profile', updatedProfile, {
            withCredentials: true,
        })
            .then((response) => {
                Swal.fire({
                    title: "สำเร็จ!",
                    text: "แก้ไขข้อมูลส่วนตัวสำเร็จ",
                    icon: "success",
                    confirmButtonText: "ตกลง",
                    timer: 3000
                });
                setEditing(false);
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลส่วนตัว:', error.message);
            });
    }

    // อัปโหลดรูปภาพ
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // แสดง preview รูปก่อนอัปโหลด
        setPreviewImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("image_path", file);
        formData.append("user_id", profile.userId);

        try {
            const res = await axios.post(HOSTNAME + "/users/update-profile-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                alert("อัปโหลดรูปสำเร็จ");

                // อัปเดตรูปโปรไฟล์ใน state
                setProfile((prev) => ({
                    ...prev,
                    profilePicture: res.data.newImagePath,
                }));
            } else {
                alert(res.data.message || "เกิดข้อผิดพลาด");
            }
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถอัปโหลดรูปได้");
        }
    };

    const formatCurrency = (num) => new Intl.NumberFormat("th-TH").format(num || 0);

    const recentDonors = donations.slice(0, 5);

    if (loading) {
        return <div className="donation-summary-detail-page"><div className="loading-spinner">กำลังโหลดข้อมูล...</div></div>;
    }

    if (!profile) {
        return <div>ไม่พบข้อมูลผู้ใช้</div>;
    }


    return (
        <section className="container">
            <div className="alumni-profile-page">
                <div className="row justify-content-center g-4">
                    {/* Sidebar/Profile */}
                    <div className="col-12 col-lg-3 col-md-4 mb-4">
                        <div className="bg-white rounded-4 shadow-sm text-center p-4">
                            <img
                                src={previewImage || profile.profilePicture}
                                alt="Profile"
                                style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: '3px solid #eee' }}
                                className="img-fluid mb-2"
                            />
                            <div className="mt-2 mb-3">
                                <label
                                    htmlFor="upload-profile-pic"
                                    className="btn btn-sm btn-outline-secondary"
                                    style={{ cursor: "pointer" }}
                                >
                                    เปลี่ยนรูป
                                </label>
                                <input
                                    type="file"
                                    id="upload-profile-pic"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <hr className="w-100" />
                            <div className="menu d-block mt-3 w-100">
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-summary-all")}>ภาพรวมข้อมูลทั้งหมด</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/president-profile/president-approve")}>จัดการสินค้า</div>
                                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-8">
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            {/* Header Section */}
                            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div>
                                            <h4 className="fw-bold mb-1">ภาพรวมข้อมูลทั้งหมด</h4>
                                            <p className="text-muted mb-0 small">สรุปภาพรวมข้อมูลสำคัญทั้งหมด</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* สถิติหลัก 4 การ์ด */}
                            <div className="summary-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="summary-card-small">
                                    <div className="summary-card-icon" style={{ backgroundColor: '#3b82f6' }}>
                                        <FaUserGraduate />
                                    </div>
                                    <div className="summary-card-info">
                                        <h3 className="text-start">{formatCurrency(statistics.totalAlumni)}</h3>
                                        <p>ศิษย์เก่าทั้งหมด</p>
                                    </div>
                                </div>

                                <div className="summary-card-small">
                                    <div className="summary-card-icon" style={{ backgroundColor: '#10b981' }}>
                                        <FaCoins />
                                    </div>
                                    <div className="summary-card-info">
                                        <h3 className="text-start">฿{formatCurrency(statistics.totalDonationAmount)}</h3>
                                        <p>ยอดบริจาครวม ({statistics.totalDonations} รายการ)</p>
                                    </div>
                                </div>

                                <div className="summary-card-small">
                                    <div className="summary-card-icon" style={{ backgroundColor: '#f59e0b' }}>
                                        <FaShoppingCart />
                                    </div>
                                    <div className="summary-card-info ">
                                        <h3 className="text-start">฿{formatCurrency(statistics.totalOrderAmount)}</h3>
                                        <p>ยอดขายสินค้า ({statistics.totalOrders} รายการ)</p>
                                    </div>
                                </div>

                                <div className="summary-card-small">
                                    <div className="summary-card-icon" style={{ backgroundColor: '#8b5cf6' }}>
                                        <FaChartLine />
                                    </div>
                                    <div className="summary-card-info">
                                        <h3 className="text-start">฿{formatCurrency(statistics.totalDonationAmount + statistics.totalOrderAmount)}</h3>
                                        <p>รายได้รวมทั้งหมด</p>
                                    </div>
                                </div>
                            </div>

                            {/* ผู้บริจาคล่าสุด */}
                            <div className="recent-donors-section">
                                <div className="recent-donors-header">
                                    <FaUsers />
                                    <h4>รายชื่อผู้บริจาคล่าสุด</h4>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        style={{ marginLeft: 'auto' }}
                                        onClick={() => navigate('/donate/donation-all')}
                                    >
                                        ดูทั้งหมด
                                    </button>
                                </div>

                                {recentDonors.length > 0 ? (
                                    <div className="recent-donors-list">
                                        {recentDonors.map((donor) => (
                                            <div key={donor.donation_id} className="donor-item">
                                                <div className="donor-avatar bg-gray-400 text-white overflow-hidden">
                                                    {donor.profile_image ? (
                                                        <img
                                                            src={`${HOSTNAME}/${donor.profile_image}`}
                                                            alt={donor.full_name || "ผู้บริจาค"}
                                                            onError={(e) => (e.target.src = `${HOSTNAME}/uploads/default-profile.png`)}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        donor.full_name ? donor.full_name.charAt(0).toUpperCase() : "?"
                                                    )}
                                                </div>

                                                <div className="donor-info">
                                                    <div className="donor-name">{donor.full_name}</div>
                                                    <div className="donor-details">
                                                        <span className="donor-amount">฿{formatCurrency(donor.amount)}</span>
                                                        <span className="donor-separator">•</span>
                                                        <span className="donor-time">
                                                            {new Date(donor.donation_date).toLocaleString("th-TH", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="donor-project">
                                                        โครงการ: {donor.project_name || "บริจาคทั่วไป"}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-donors-message">ยังไม่มีผู้บริจาค</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PresidentSummaryAll;