import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../css/profile.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AlumniProfileDonation() {
    const [profile, setProfile] = useState({});
    const [donations, setDonations] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [sortOrder, setSortOrder] = useState('desc');
    const { handleLogout } = useOutletContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        axios.get('http://localhost:3001/users/profile', { withCredentials: true })
            .then((res) => {
                if (res.data.success) {
                    setProfile(res.data.user);
                }
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
            });

        axios.get('http://localhost:3001/donate/donatePaid', { withCredentials: true })
            .then((res) => {
                setDonations(res.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching donations:', error);
                setLoading(false);
            });
    }, []);

    const handleClick = (path) => navigate(path);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB');
            return;
        }

        setPreviewImage(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append('image_path', file);
        formData.append('user_id', profile.userId);

        try {
            const res = await axios.post('http://localhost:3001/users/update-profile-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.status === 200) {
                alert('อัปโหลดรูปสำเร็จ');
                setProfile((prev) => ({ ...prev, profilePicture: res.data.newImagePath }));
            } else {
                alert(res.data.message || 'เกิดข้อผิดพลาด');
            }
        } catch (err) {
            console.error(err);
            setPreviewImage(null);
            alert('ไม่สามารถอัปโหลดรูปได้');
        }
    };

    // ฟังก์ชันกำหนดสีสถานะ
    const getStatusStyle = (status) => {
        let style = {};
        let label = status;
        let icon = '';

        switch (status?.toLowerCase()) {
            case 'paid':
                style = {
                    color: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                };
                label = 'ชำระเงินแล้ว';
                icon = 'fas fa-check-circle';
                break;
            case 'pending':
                style = {
                    color: '#ff8800',
                    backgroundColor: 'rgba(255, 136, 0, 0.1)',
                    border: '1px solid rgba(255, 136, 0, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                };
                label = 'รอดำเนินการ';
                icon = 'fas fa-clock';
                break;
            case 'failed':
                style = {
                    color: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                };
                label = 'ล้มเหลว/ยกเลิก';
                icon = 'fas fa-times-circle';
                break;
            default:
                style = {
                    color: '#6c757d',
                    backgroundColor: 'rgba(108, 117, 125, 0.1)',
                    border: '1px solid rgba(108, 117, 125, 0.2)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                };
                label = status || 'ไม่ทราบสถานะ';
                icon = 'fas fa-question-circle';
        }

        return (
            <span style={style} className="d-inline-flex align-items-center">
                <i className={`${icon} me-1`}></i>
                {label}
            </span>
        );
    };

    // คำนวณสถิติ
    const totalDonations = donations.reduce((sum, donation) => sum + Number(donation.amount), 0);
    const successfulDonations = donations.filter(d => d.payment_status?.toLowerCase() === 'paid');
    const pendingDonations = donations.filter(d => d.payment_status?.toLowerCase() === 'pending');

    // กรองและเรียงลำดับข้อมูล
    const filteredDonations = donations
        .filter(donation =>
            (filterStatus === 'all' || donation.payment_status?.toLowerCase() === filterStatus) &&
            (filterYear === 'all' || (new Date(donation.created_at).getFullYear() + 543).toString() === filterYear)
        )
        .sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    if (loading) {
        return (
            <section className='container py-4'>
                <div className='d-flex justify-content-center align-items-center' style={{ minHeight: '400px' }}>
                    <div className='text-center'>
                        <div className='spinner-border text-primary mb-3' role='status' style={{ width: '3rem', height: '3rem' }}>
                            <span className='visually-hidden'>กำลังโหลด...</span>
                        </div>
                        <p className='text-muted'>กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='container py-4'>
            <div className='alumni-profile-page'>
                <div className='row justify-content-center g-4'>
                    <div className='col-12 col-md-3 mb-4'>
                        <div className='bg-white rounded-4 shadow-sm text-center p-4'>
                            <img
                                src={previewImage || profile.profilePicture}
                                alt='Profile'
                                style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '3px solid #eee' }}
                                className='img-fluid mb-2'
                            />
                            <div className='mt-2 mb-3'>
                                <label htmlFor='upload-profile-pic' className='btn btn-sm btn-outline-secondary'>เปลี่ยนรูป</label>
                                <input type='file' id='upload-profile-pic' className='d-none' accept='image/*' onChange={handleImageChange} />
                            </div>
                            <hr className='w-100' />
                            <div className='menu d-block mt-3 w-100'>
                                {[
                                    ['ข้อมูลส่วนตัว', '/alumni-profile'],
                                    ['คำร้องขอ', '/alumni-profile/alumni-request'],
                                    ['จัดการคำสั่งซื้อของที่ระลึก', '/alumni-profile/alumni-manage-orders'],
                                    ['กระทู้ที่สร้าง', '/alumni-profile/alumni-profile-webboard'],
                                    ['ประวัติการบริจาค', '/alumni-profile/alumni-profile-donation'],
                                    ['ประวัติการเข้าร่วมกิจกรรม', '/alumni-profile/alumni-profile-activity'],
                                    ['ประวัติการสั่งซื้อของที่ระลึก', '/alumni-profile/alumni-profile-souvenir'],
                                ].map(([label, path], i) => (
                                    <div key={i} className={`menu-item py-2 mb-2 rounded ${location.pathname === path ? 'active' : ''}`} onClick={() => handleClick(path)}>{label}</div>
                                ))}
                                <div className='menu-item py-2 rounded' onClick={handleLogout}>ออกจากระบบ</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className='col-12 col-md-8'>
                        <div className='bg-white rounded-4 shadow-sm p-4 mb-4'>
                            <div className='d-flex align-items-center'>
                                <div className='bg-success bg-opacity-10 rounded-circle p-2 me-3'>
                                    <i className='fas fa-calendar-check text-success fs-5'></i>
                                </div>
                                <div>
                                    <h4 className='fw-bold mb-1'>ประวัติการบริจาค</h4>
                                    <p className='text-muted mb-0 small'>รวบรวมโครงการที่คุณบริจาคทั้งหมด</p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className='row g-3 mb-4'>
                            <div className='col-md-4'>
                                <div className='bg-white rounded-4 shadow-sm p-4 h-100'>
                                    <div className='d-flex align-items-center'>
                                        <div>
                                            <h5 className='fw-bold mb-0'>{totalDonations.toLocaleString()}</h5>
                                            <p className='text-muted mb-0 small'>บาท ยอดรวมทั้งหมด</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4'>
                                <div className='bg-white rounded-4 shadow-sm p-4 h-100'>
                                    <div className='d-flex align-items-center'>
                                        <div>
                                            <h5 className='fw-bold mb-0'>{successfulDonations.length}</h5>
                                            <p className='text-muted mb-0 small'>ครั้ง การบริจาคสำเร็จ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-4'>
                                <div className='bg-white rounded-4 shadow-sm p-4 h-100'>
                                    <div className='d-flex align-items-center'>
                                        <div>
                                            <h5 className='fw-bold mb-0'>{pendingDonations.length}</h5>
                                            <p className='text-muted mb-0 small'>ครั้ง รอดำเนินการ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter and Sort Controls */}
                        <div
                            className='bg-white rounded-4 shadow-sm p-4 mb-4 d-flex align-items-center'
                            style={{ minHeight: '100px' }}
                        >
                            <div className='row w-100'>
                                {/* กรองสถานะ */}
                                <div className='col-md-6 d-flex align-items-center justify-content-md-start justify-content-center mb-2 mb-md-0'>
                                    <label className='form-label mb-0 me-2'>กรองสถานะ:</label>
                                    <select
                                        className='form-select form-select-sm'
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        style={{ maxWidth: '200px' }}
                                    >
                                        <option value='all'>ทั้งหมด</option>
                                        <option value='paid'>ชำระเงินแล้ว</option>
                                        <option value='pending'>รอดำเนินการ</option>
                                        <option value='failed'>ล้มเหลว/ยกเลิก</option>
                                    </select>
                                </div>

                                {/* กรองสถานะตามปีที่บริจาค */}
                                <div className='col-md-6 d-flex align-items-center justify-content-md-start justify-content-center mb-2 mb-md-0'>
                                    <label className='form-label mb-0 me-2'>กรองตามปีที่บริจาค:</label>
                                    <select
                                        className='form-select form-select-sm'
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        style={{ maxWidth: '200px' }}
                                    >
                                        <option value='all'>ทั้งหมด</option>
                                        {Array.from(new Set(donations.map(d => new Date(d.created_at).getFullYear())))
                                            .sort((a, b) => b - a)
                                            .map(year => (
                                                <option key={year} value={year + 543}>{year + 543}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* เรียงลำดับ */}
                                <div className='col-md-6 d-flex align-items-center justify-content-md-end justify-content-center'>
                                    <label className='form-label mb-0 me-2'>เรียงลำดับ:</label>
                                    <select
                                        className='form-select form-select-sm'
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        style={{ maxWidth: '150px' }}
                                    >
                                        <option value='desc'>ใหม่ → เก่า</option>
                                        <option value='asc'>เก่า → ใหม่</option>
                                    </select>
                                </div>

                            </div>
                        </div>


                        {/* Donations List */}
                        <div className='row g-4'>
                            {filteredDonations.length === 0 ? (
                                <div className='col-12'>
                                    <div className='bg-white rounded-4 shadow-sm p-5 text-center'>
                                        <div className='mb-4'>
                                            <i className='fas fa-heart text-muted' style={{ fontSize: '4rem' }}></i>
                                        </div>
                                        <h5 className='text-muted mb-2'>ไม่พบข้อมูลการบริจาค</h5>
                                        <p className='text-muted mb-4'>
                                            {filterStatus !== 'all'
                                                ? `ไม่พบการบริจาคที่มีสถานะ "${filterStatus}"`
                                                : 'คุณยังไม่เคยทำการบริจาคโครงการใดๆ'
                                            }
                                        </p>
                                        {filterStatus !== 'all' && (
                                            <button
                                                className='btn btn-primary'
                                                onClick={() => setFilterStatus('all')}
                                            >
                                                <i className='fas fa-eye me-2'></i>
                                                ดูทั้งหมด
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                filteredDonations.map((donation, index) => (
                                    <div key={index} className='col-12'>
                                        <div className='bg-white rounded-4 shadow-sm p-4 hover-shadow' style={{ transition: 'all 0.3s ease' }}>
                                            <div className='row align-items-center'>
                                                <div className='col-md-8'>
                                                    <div className='d-flex align-items-start'>
                                                        {/* <div className='bg-primary bg-opacity-10 rounded-circle p-3 me-3'>
                                                            <i className='fas fa-project-diagram text-primary fs-5'></i>
                                                        </div> */}
                                                        <div className='flex-grow-1'>
                                                            <h5 className='fw-bold mb-2 text-primary'>
                                                                {donation.project_name || 'ไม่ระบุชื่อโครงการ'}
                                                            </h5>
                                                            <div className='mb-2'>
                                                                <span className='badge bg-light text-dark border me-2'>
                                                                    <i className='fas fa-coins me-1'></i>
                                                                    {Number(donation.amount).toLocaleString()} บาท
                                                                </span>
                                                                {getStatusStyle(donation.payment_status)}
                                                            </div>
                                                            <p className='text-muted mb-0 small'>
                                                                <i className='fas fa-calendar-alt me-2'></i>
                                                                {new Date(donation.created_at).toLocaleString('th-TH', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-md-4 text-md-end mt-3 mt-md-0'>
                                                    <div className='text-end'>
                                                        <div className='h4 fw-bold text-success mb-0'>
                                                            ฿{Number(donation.amount).toLocaleString()}
                                                        </div>
                                                        <small className='text-muted'>ยอดบริจาค</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination or Load More (if needed) */}
                        {filteredDonations.length > 0 && (
                            <div className='text-center mt-4'>
                                <p className='text-muted small'>
                                    แสดง {filteredDonations.length} รายการจาก {donations.length} รายการทั้งหมด
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .sticky-top {
                    z-index: 100;
                }
                
                .bg-gradient {
                    background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%) !important;
                }

                @media (max-width: 768px) {
                    .sticky-top {
                        position: relative !important;
                        top: auto !important;
                    }
                }
            `}</style>
        </section>
    );
}

export default AlumniProfileDonation;