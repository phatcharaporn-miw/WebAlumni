import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Search } from "lucide-react";
import '../css/CheckStudentId.css'; 
import {HOSTNAME} from '../config.js';

function CheckFullName() {
    const [userData, setUserData] = useState({
        username: '',
        password: '',
        email: '',
        role: '',
        full_name: '',
        nick_name: '',
        title: '',
        birthday: '',
        address: '',
        phone: '',
        line: '',
        education: [
            {
                degree: '',
                major: '',
                studentId: '',
                graduation_year: '',
            },
        ],
    });

    const [isSearching, setIsSearching] = useState(false);
    const [fullName, setFullName] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await axios.post(HOSTNAME +'/api/check-fullname', { full_name: fullName });

            if (res.data.success) {
                setResult({
                    found: true,
                    message: res.data.message,
                    student: res.data.data, // อาจเป็น object (1 รายการ) หรือ array (หลายรายการ)
                });
            } 
        } catch (error) {
            console.error('เกิดข้อผิดพลาด:', error);
            setResult({
                found: false,
                message: error.response?.data?.message || 'ไม่พบข้อมูลในระบบ กรุณาลงทะเบียน',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='container'>
            <div className="check-studentId-page">
                <div className="text-center">
                    <div className="d-inline-block position-relative">
                        <h3 id="head-text" className="text-center mb-3 position-relative">
                            ตรวจสอบข้อมูลศิษย์เก่า
                            <div className="title-underline position-absolute start-50 translate-middle-x mt-2"
                                style={{
                                    width: '120px',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #007bff, #6610f2)',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                                }}>
                            </div>
                        </h3>

                        {/* Decorative elements */}
                        <div className="position-absolute top-0 start-0 translate-middle">
                            <div className="bg-primary opacity-25 rounded-circle"
                                style={{ width: '20px', height: '20px' }}>
                            </div>
                        </div>
                        <div className="position-absolute top-0 end-0 translate-middle">
                            <div className="bg-success opacity-25 rounded-circle"
                                style={{ width: '15px', height: '15px' }}>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='d-flex justify-content-center'>
                    <div className="section-card border border-primary bg-primary bg-opacity-10 p-4 rounded m-5 w-75">
                        <h3 className="h5 fw-semibold text-primary mb-3 d-flex align-items-center">
                            <Search className="me-2" size={20} />
                            ค้นหาข้อมูลของท่าน
                        </h3>

                        <form onSubmit={handleCheck} className="mb-4">
                            <p className="text-primary mb-3 fs-6">
                                กรุณากรอกชื่อ-นามสกุลเพื่อค้นหาข้อมูลของท่าน
                            </p>

                            <div className="row g-2 mb-3 align-items-center">
                                <div className="col">
                                    <input
                                        type="text"
                                        placeholder="กรอกชื่อ-นามสกุล (เช่น สมชาย สายดี)"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="form-control w-100"
                                        autoFocus
                                    />
                                </div>
                                <div className="col-auto">
                                    <button
                                        type="submit"
                                        className="btn btn-primary d-flex align-items-center px-4"
                                        disabled={isSearching || fullName.trim() === ''}
                                    >
                                        {isSearching || loading ? (
                                            <>
                                                <div
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                    aria-hidden="true"
                                                />
                                                กำลังค้นหา...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="me-2" size={16} />
                                                ค้นหา
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {result && (
                            <div
                                className={`alert mt-3 ${result.found ? 'alert-success' : 'alert-danger'}`}
                                role="alert"
                            >
                                {result.found ? (
                                    Array.isArray(result.student) ? (
                                        <>
                                            <h4 className="alert-heading h6 fw-semibold">
                                                พบข้อมูลศิษย์เก่าหลายรายการ
                                            </h4>
                                            <p className="mb-2">
                                                พบข้อมูลมากกว่า 1 รายการ กรุณาตรวจสอบหรือติดต่อแอดมินเพื่อยืนยันตัวตน
                                            </p>
                                            {result.student.map((student, index) => (
                                                <div key={index} className="small mb-3 p-3 border rounded">
                                                    <p className="mb-1">
                                                        <strong>รหัสนักศึกษา:</strong> {student.studentId}
                                                    </p>
                                                    <p className="mb-1">
                                                        <strong>ชื่อ-นามสกุล:</strong> {student.full_name}
                                                    </p>
                                                    <p className="mb-1">
                                                        <strong>สาขา:</strong> {student.major_name}
                                                    </p>
                                                    <p className="mb-1">
                                                        <strong>ระดับการศึกษา:</strong> {student.degree_name}
                                                    </p>
                                                    <p className="mb-1">
                                                        <strong>ปีที่จบ:</strong> {student.graduation_year}
                                                    </p>
                                                </div>
                                            ))}
                                            <a href="/login" className="btn btn-outline-success btn-sm">
                                                ไปหน้าเข้าสู่ระบบ
                                            </a>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="alert-heading h6 fw-semibold">พบข้อมูลศิษย์เก่า</h4>
                                            <div className="small">
                                                <p className="mb-1">
                                                    <strong>รหัสนักศึกษา:</strong> {result.student.studentId}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>ชื่อ-นามสกุล:</strong> {result.student.full_name}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>สาขา:</strong> {result.student.major_name}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>ระดับการศึกษา:</strong> {result.student.degree_name}
                                                </p>
                                                <p className="mb-3">
                                                    <strong>ปีที่จบ:</strong> {result.student.graduation_year}
                                                </p>
                                            </div>
                                            <a href="/login" className="btn btn-outline-success btn-sm">
                                                ไปหน้าเข้าสู่ระบบ
                                            </a>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <p className="mb-2">{result.message || 'ไม่พบบัญชีของคุณ กรุณาลงทะเบียน'}</p>
                                        <a href="/register" className="btn btn-outline-danger btn-sm">
                                            ลงทะเบียน
                                        </a>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CheckFullName;