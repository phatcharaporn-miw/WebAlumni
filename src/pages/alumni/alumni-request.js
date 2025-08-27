import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
// css
import '../../css/profile.css';

// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AlumniProfileRequest() {
    const [pendingDonations, setPendingDonations] = useState([]);
    const [profile, setProfile] = useState({});
    const { handleLogout } = useOutletContext();
    // const [activity, setActivity] = useState([]);
    // const [selectedStatus, setSelectedStatus] = useState('activity');
    const [previewImage, setPreviewImage] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // ดึงข้อมูลโปรไฟล์
    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', {
            withCredentials: true
        })
            .then((response) => {
                if (response.data.success) {
                    setProfile(response.data.user);
                }
            })
            .catch((error) => {
                console.error('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์:', error.response ? error.response.data.message : error.message);
            });
    }, []);

    // ดึงข้อมูลคำร้องที่รออนุมัติ
    useEffect(() => {
        axios.get("http://localhost:3001/souvenir/pending-requests", { withCredentials: true })
            .then(res => {
                setPendingRequests(res.data || []);
            })
            .catch(err => {
                setPendingRequests([]);
            })
            .finally(() => setLoadingRequests(false));
    }, []);

    useEffect(() => {
        axios.get("http://localhost:3001/donate/donatePending", { withCredentials: true })
            .then(res => {
                // console.log("Donation data:", res.data);
                setPendingDonations(res.data || []);
            })
            .catch(err => {
                console.error('Error fetching donation requests:', err);
                setPendingDonations([]);
            });
    }, []);

    const handleViewDetail = (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        const isSouvenir = !!item.product_name;

        Swal.fire({
            title: isSouvenir ? `ของที่ระลึก: ${item.product_name}` : `โครงการ: ${item.project_name}`,
            html: `
            <div style="text-align: left">
                ${item.description ? `<p><strong>รายละเอียด:</strong> ${item.description}</p>` : ''}
                ${item.price ? `<p><strong>ราคา:</strong> ฿${Number(item.price).toLocaleString()}</p>` : ''}
                ${item.target_amount ? `<p><strong>เป้าหมาย:</strong> ฿${Number(item.target_amount).toLocaleString()}</p>` : ''}
                ${item.account_name ? `<p><strong>ชื่อบัญชี:</strong> ${item.account_name}</p>` : ''}
                ${item.bank_name ? `<p><strong>ธนาคาร:</strong> ${item.bank_name}</p>` : ''}
                ${item.created_at ? `<p><strong>วันที่สร้าง:</strong> ${new Date(item.created_at).toLocaleDateString('th-TH')}</p>` : ''}
                ${item.full_name ? `<p><strong>โดย:</strong> ${item.full_name}</p>` : ''}
            </div>
        `,
            imageUrl: item.image_path
                ? `http://localhost:3001/uploads/${item.image_path}`
                : item.image
                    ? `http://localhost:3001/uploads/${item.image}`
                    : '/default-image.png',
            imageWidth: 400,
            imageAlt: 'ภาพประกอบ',
            showCloseButton: true,
            confirmButtonText: 'ปิด',
        });
    };


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
            const res = await axios.post("http://localhost:3001/users/update-profile-image", formData, {
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

    const handleClick = (path) => {
        navigate(path);
    };

    return (
        <section className='container py-4'>
            <div className='alumni-profile-page'>
                <div className="row justify-content-center g-4">
                    <div className="col-12 col-md-3 mb-4">
                        <div className="bg-white rounded-4 shadow-sm text-center p-4">
                            <img
                                src={previewImage || profile.profilePicture}
                                alt="Profile"
                                style={{
                                    width: "130px",
                                    height: "130px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    marginBottom: 16,
                                    border: '3px solid #eee'
                                }}
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
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile")}>โปรไฟล์ของฉัน</div>
                                <div className="menu-item active py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-request")}>คำร้องขอ</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-manage-orders")}>จัดการคำสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-webboard")}>กระทู้ที่สร้าง</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-donation")}>ประวัติการบริจาค</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-activity")}>ประวัติการเข้าร่วมกิจกรรม</div>
                                <div className="menu-item py-2 mb-2 rounded" onClick={() => handleClick("/alumni-profile/alumni-profile-souvenir")}>ประวัติการสั่งซื้อของที่ระลึก</div>
                                <div className="menu-item py-2 rounded" onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="col-12 col-md-8">
                        {/* Header Section */}
                        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                        <i className="fas fa-comment-dots text-primary fs-5"></i>
                                    </div>
                                    <div>
                                        <h4 className="fw-bold mb-1">รายการคำร้องที่รออนุมัติ</h4>
                                        <p className="text-muted mb-0 small">รายการที่ส่งเพื่อพิจารณาอนุมัติ</p>
                                    </div>
                                </div>
                                {!loadingRequests && pendingRequests.length > 0 && (
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                                            {pendingRequests.length} รายการ
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {loadingRequests ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <div className="text-muted">กำลังโหลดข้อมูล...</div>
                            </div>
                        ) : pendingRequests.length + pendingDonations.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                                    <i className="fas fa-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h5 className="text-muted mb-2">ไม่มีคำร้องที่รออนุมัติ</h5>
                                <p className="text-muted small mb-0">รายการที่ส่งเพื่อพิจารณาจะปรากฏที่นี่</p>
                            </div>
                        ) : (
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                                {[...pendingRequests, ...pendingDonations].map((item, idx) => {
                                    const linkTo = item.product_id
                                        ? `/souvenir/souvenirDetail/${item.product_id}`
                                        : `/donate/donateDetail/${item.project_id}`;
                                    const altText = item.product_name
                                        ? `ของที่ระลึก: ${item.product_name}`
                                        : item.project_name
                                            ? `โครงการ: ${item.project_name}`
                                            : "รายการ";

                                    return (
                                        <div className="col" key={item.product_id || item.project_id || idx}>
                                            <Link to={linkTo} className="text-decoration-none">
                                                <div className="card h-100 shadow-sm border-0 position-relative overflow-hidden hover-card">
                                                    <div className="position-absolute top-0 start-0 z-index-1 m-3">
                                                        <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                                                            <i className="fas fa-clock me-1"></i> รออนุมัติ
                                                        </span>
                                                    </div>

                                                    <div className="position-relative overflow-hidden">
                                                        <img
                                                            className="card-img-top hover-zoom"
                                                            src={
                                                                item.image
                                                                    ? `http://localhost:3001/uploads/${item.image}`
                                                                    : item.image_path
                                                                        ? `http://localhost:3001/uploads/${item.image_path}`
                                                                        : "/default-image.png"
                                                            }
                                                            alt={altText}
                                                            style={{
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                                transition: 'transform 0.3s ease'
                                                            }}
                                                        />
                                                        <div className="image-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-0 transition-all"></div>
                                                    </div>

                                                    <div className="card-body text-center p-4">
                                                        <h6 className="card-title fw-semibold mb-2 text-dark line-clamp-2">
                                                            {item.product_name || item.project_name || "ชื่อไม่ระบุ"}
                                                        </h6>

                                                        {item.price && !isNaN(item.price) && (
                                                            <div className="mb-3">
                                                                <span className="text-success fw-bold fs-5">
                                                                    ฿{Number(item.price).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="d-flex justify-content-between align-items-center small text-muted">
                                                            <span>
                                                                <i className="fas fa-calendar me-1"></i>
                                                                {item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                                                            </span>
                                                            <span>
                                                                <i className="fas fa-user me-1"></i>
                                                                {item.full_name || 'ไม่ระบุ'}
                                                            </span>

                                                        </div>
                                                    </div>

                                                    <div className="card-footer bg-light border-0 p-3">
                                                        <div className="d-flex gap-2">
                                                            <button
                                                                className="btn btn-outline-primary btn-sm flex-fill"
                                                                onClick={(e) => handleViewDetail(e, item)}
                                                            >
                                                                <i className="fas fa-eye me-1"></i> ดูรายละเอียด
                                                            </button>

                                                        </div>

                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style>{`
                .hover-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
                }
                .hover-zoom:hover {
                    transform: scale(1.05);
                }
                .image-overlay {
                    transition: background-color 0.3s ease;
                }
                .hover-card:hover .image-overlay {
                    background-color: rgba(0,0,0,0.1) !important;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    line-height: 1.4;
                    max-height: 2.8em;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
                .z-index-1 {
                    z-index: 1;
                }
                .bg-opacity-0 {
                    background-color: rgba(0,0,0,0) !important;
                }
                .bg-opacity-10 {
                    background-color: rgba(var(--bs-warning-rgb), 0.1) !important;
                }
                
                
            `}</style>
        </section>
    );
}

export default AlumniProfileRequest;