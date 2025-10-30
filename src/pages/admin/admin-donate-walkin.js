import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserPlus, Save, AlertCircle } from "lucide-react";
import { HOSTNAME } from "../../config";
import Swal from 'sweetalert2';

function WalkInDonationForm() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        projectId: "",
        amount: "",
        purpose: "",
        paymentMethod: "cash"
    });
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(HOSTNAME + "/admin/projects/active");
            setProjects(response.data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }

        if (name === 'isGeneralDonation' && checked) {
            setFormData(prev => ({
                ...prev,
                projectId: ""
            }));
            if (errors.projectId) {
                setErrors(prev => ({
                    ...prev,
                    projectId: ""
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "กรุณากรอกชื่อ-นามสกุล";
        }

        // if (!formData.projectId) {
        //     newErrors.projectId = "กรุณาเลือกโครงการ";
        // }

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = "กรุณากรอกจำนวนเงินที่ถูกต้อง";
        }

        if (!formData.purpose.trim()) {
            newErrors.purpose = "กรุณากรอกวัตถุประสงค์";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const donationData = {
                donor_name: formData.fullName,
                donor_phone: formData.phone || null,
                donor_email: formData.email || null,
                donor_address: formData.address || null,
                project_id: formData.projectId,
                amount: parseFloat(formData.amount),
                purpose: formData.purpose,
                note: formData.note || null,
                payment_method: formData.paymentMethod,
                payment_status: "paid",
                donation_type: "walk_in",
                use_tax: formData.taxReceiptRequired ? 1 : 0
            };

            await axios.post(HOSTNAME + "/admin/donations/walk-in", donationData);

            Swal.fire({
                title: "บันทึกการบริจาคสำเร็จ!",
                text: "การบริจาคสำเร็จแล้ว",
                icon: "success",
                confirmButtonText: "ตกลง"
            }).then(() => {
                navigate("/admin/donations/check-donation-list");
            });


            setFormData({
                fullName: "",
                phone: "",
                email: "",
                address: "",
                projectId: "",
                amount: "",
                purpose: "",
                paymentMethod: "cash"
            });
            setErrors({});



        } catch (error) {
            console.error("Error submitting donation:", error);
            alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            fullName: "",
            phone: "",
            email: "",
            address: "",
            projectId: "",
            amount: "",
            purpose: "",
            paymentMethod: "cash"
        });
        setErrors({});
    };

    return (
        <div className="donate-activity-container">
            <div className="mb-4">
                            <nav className="nav Adminnav-tabs">
                                <Link 
                                    className={`adminnav-link ${location.pathname === '/admin/donations/donation-list' ? 'active' : ''}`} 
                                    to="/admin/donations/donation-list"
                                >
                                    รายการบริจาคทั้งหมด
                                </Link>
                                <Link
                                    className={`adminnav-link ${location.pathname === '/admin/donations' ? 'active' : ''}`}
                                    to="/admin/donations"
                                >
                                    การจัดการโครงการบริจาค
                                </Link>
                    
                                <Link 
                                    className={`adminnav-link ${location.pathname === '/admin/donations/walkin-donation' ? 'active' : ''}`} 
                                    to="/admin/donations/walkin-donation"
                                >
                                    บันทึกการบริจาค Walk-in
                                </Link>
                                <Link
                                    className={`adminnav-link ${location.pathname === '/admin/donations/donate-request' ? 'active' : ''}`}
                                    to="/admin/donations/donate-request"
                                >
                                    เพิ่มโครงการใหม่
                                </Link>
                            </nav>
                        </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="donate-activity-title">บันทึกการบริจาค Walk-in</h2>
            </div>

            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <div className="mb-4 pb-3 border-bottom">
                                <div className="d-flex align-items-center">
                                    <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                                        <UserPlus size={28} className="text-primary" />
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold">บันทึกการบริจาคแบบ Walk-in</h5>
                                        <small className="text-muted">สำหรับผู้บริจาคที่เดินเข้ามาหน้าคณะโดยตรง</small>
                                    </div>
                                </div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                {/* ข้อมูลผู้บริจาค */}
                                <div className="mb-4 bg-light bg-opacity-50 p-4 rounded-3">
                                    <h6 className=" mb-3 fw-bold d-flex align-items-center " style={{ color: '#0F75BC' }}>
                                        ข้อมูลผู้บริจาค <span className="text-danger ms-1">*</span>
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                ชื่อ-นามสกุล <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.fullName ? 'is-invalid' : ''} w-100`}
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="กรอกชื่อจริง"
                                            />
                                            {errors.fullName && (
                                                <div className="invalid-feedback">{errors.fullName}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                เบอร์โทรศัพท์ <small className="text-muted">(ไม่บังคับ)</small>
                                            </label>
                                            <input
                                                type="tel"
                                                className="form-control w-100"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="0XX-XXX-XXXX"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                อีเมล <small className="text-muted">(ไม่บังคับ)</small>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control w-100"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="example@email.com"
                                                onKeyDown={(e) => {
                                                    const allowedChars = /[a-zA-Z0-9@._-]/;
                                                    if (!allowedChars.test(e.key) && e.key !== "Backspace" && e.key !== "Tab") {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <hr />

                                {/* รายละเอียดการบริจาค */}
                                <div className="mb-4 bg-light bg-opacity-50 p-4 rounded-3">
                                    <h6 className="mb-3 fw-bold d-flex align-items-center" style={{ color: '#0F75BC' }}>
                                        รายละเอียดการบริจาค <span className="text-danger ms-1">*</span>
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="isGeneralDonation"
                                                    name="isGeneralDonation"
                                                    checked={formData.isGeneralDonation}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label fw-bold" style={{ color: '#0F75BC' }} htmlFor="isGeneralDonation">
                                                    บริจาคทั่วไป (ไม่ระบุโครงการ)
                                                </label>
                                            </div>
                                            <small className="text-muted ms-4">เลือกตัวเลือกนี้หากผู้บริจาคไม่ต้องการระบุโครงการที่บริจาค</small>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                เลือกโครงการที่ต้องการบริจาค {!formData.isGeneralDonation && <span className="text-danger">*</span>}
                                            </label>
                                            <select
                                                className={`form-select ${errors.projectId ? 'is-invalid' : ''}`}
                                                name="projectId"
                                                value={formData.projectId}
                                                onChange={handleChange}
                                                disabled={formData.isGeneralDonation}
                                            >
                                                <option value="">-- เลือกโครงการ --</option>
                                                {projects.map(project => (
                                                    <option key={project.project_id} value={project.project_id}>
                                                        {project.project_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.projectId && (
                                                <div className="invalid-feedback">{errors.projectId}</div>
                                            )}
                                            {formData.isGeneralDonation && (
                                                <small className="text-muted">บริจาคทั่วไป - ไม่ได้ระบุโครงการ</small>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                จำนวนเงิน (บาท) <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.amount ? 'is-invalid' : ''} mt-0 w-100`}
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                min="1"
                                                step="0.01"
                                            />
                                            {errors.amount && (
                                                <div className="invalid-feedback">{errors.amount}</div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label">
                                                วัตถุประสงค์การบริจาค <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className={`form-control ${errors.purpose ? 'is-invalid' : ''} w-100`}
                                                name="purpose"
                                                value={formData.purpose}
                                                onChange={handleChange}
                                                rows="3"
                                                placeholder="ระบุวัตถุประสงค์ เช่น เพื่อสนับสนุนการศึกษา, ทำบุญวันเกิด, บริจาคทั่วไป"
                                            />
                                            {errors.purpose && (
                                                <div className="invalid-feedback">{errors.purpose}</div>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label">
                                                วิธีการชำระเงิน
                                            </label>
                                            <select
                                                className="form-select"
                                                name="paymentMethod"
                                                value={formData.paymentMethod}
                                                onChange={handleChange}
                                            >
                                                <option value="cash">เงินสด</option>
                                                <option value="transfer">โอนเงิน</option>
                                                <option value="check">เช็ค</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* ข้อมูลใบกำกับภาษี */}
                                <div className="mb-4 bg-light bg-opacity-50 p-4 rounded-3">
                                    <h6 className="mb-3 fw-bold d-flex align-items-center " style={{ color: '#0F75BC' }}>
                                        ข้อมูลใบกำกับภาษี
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="taxReceiptRequired"
                                                    name="taxReceiptRequired"
                                                    checked={formData.taxReceiptRequired}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label fw-bold" htmlFor="taxReceiptRequired">
                                                    ต้องการใบกำกับภาษี
                                                </label>
                                            </div>
                                            <small className="text-muted ms-4">เลือกตัวเลือกนี้หากผู้บริจาคต้องการใบกำกับภาษีเพื่อใช้ลดหย่อนภาษี</small>
                                        </div>

                                        {formData.taxReceiptRequired && (
                                            <>
                                                <div className="col-md-6">
                                                    <label className="form-label">
                                                        เลขประจำตัวผู้เสียภาษี <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.taxId ? 'is-invalid' : ''} w-100`}
                                                        name="taxId"
                                                        value={formData.taxId}
                                                        onChange={handleChange}
                                                        placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                                                        maxLength="13"
                                                    />
                                                    {errors.taxId && (
                                                        <div className="invalid-feedback">{errors.taxId}</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* ข้อมูลใบกำกับภาษี */}
                                {/* <div className="mb-4 bg-light bg-opacity-50 p-4 rounded-3">
                                    <h6 className="mb-3 fw-bold d-flex align-items-center" style={{ color: '#0F75BC' }}>
                                        ข้อมูลใบกำกับภาษี
                                    </h6>

                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="taxReceiptRequired"
                                                    name="taxReceiptRequired"
                                                    checked={formData.taxReceiptRequired || false}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            taxReceiptRequired: checked,
                                                            taxType: "",
                                                            name: "",
                                                            company_name: "",
                                                            tax_number: "",
                                                            phone: "",
                                                            email: "",
                                                        }));
                                                    }}
                                                />
                                                <label className="form-check-label fw-bold" htmlFor="taxReceiptRequired">
                                                    ต้องการใบกำกับภาษี
                                                </label>
                                            </div>
                                            <small className="text-muted ms-4">
                                                เลือกตัวเลือกนี้หากผู้บริจาคต้องการใบกำกับภาษีเพื่อใช้ลดหย่อนภาษี
                                            </small>
                                        </div>

                                        {formData.taxReceiptRequired && (
                                            <div className="col-12">
                                                <div className="tax-type-options-btn mb-3">
                                                    <button
                                                        type="button"
                                                        className={`btn btn-outline-primary me-2 ${formData.taxType === "individual" ? "active" : ""}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, taxType: "individual" }))}
                                                    >
                                                        บุคคลธรรมดา
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`btn btn-outline-primary ${formData.taxType === "corporate" ? "active" : ""}`}
                                                        onClick={() => setFormData(prev => ({ ...prev, taxType: "corporate" }))}
                                                    >
                                                        นิติบุคคล
                                                    </button>
                                                </div>

                                                {formData.taxType === "individual" ? (
                                                    <>
                                                        <div className="mb-3">
                                                            <label className="form-label">ชื่อ-นามสกุล <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleChange}
                                                                placeholder="ชื่อ-นามสกุล"
                                                            />
                                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">เลขบัตรประชาชน (13 หลัก) <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.tax_number ? "is-invalid" : ""}`}
                                                                name="tax_number"
                                                                value={formData.tax_number}
                                                                onChange={handleChange}
                                                                placeholder="เลขบัตรประชาชน"
                                                                maxLength="13"
                                                            />
                                                            {errors.tax_number && <div className="invalid-feedback">{errors.tax_number}</div>}
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">เบอร์โทรศัพท์ (10 หลัก) <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleChange}
                                                                placeholder="หมายเลขโทรศัพท์"
                                                                maxLength="10"
                                                            />
                                                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">อีเมล <span className="text-danger">*</span></label>
                                                            <input
                                                                type="email"
                                                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                                                name="email"
                                                                value={formData.email}
                                                                onChange={handleChange}
                                                                placeholder="example@email.com"
                                                            />
                                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="mb-3">
                                                            <label className="form-label">ชื่อบริษัท/นิติบุคคล <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.company_name ? "is-invalid" : ""}`}
                                                                name="company_name"
                                                                value={formData.company_name}
                                                                onChange={handleChange}
                                                                placeholder="ชื่อบริษัท/นิติบุคคล"
                                                            />
                                                            {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">เลขประจำตัวผู้เสียภาษี (13 หลัก) <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.tax_number ? "is-invalid" : ""}`}
                                                                name="tax_number"
                                                                value={formData.tax_number}
                                                                onChange={handleChange}
                                                                placeholder="เลขประจำตัวผู้เสียภาษี"
                                                                maxLength="13"
                                                            />
                                                            {errors.tax_number && <div className="invalid-feedback">{errors.tax_number}</div>}
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">เบอร์โทรศัพท์ (10 หลัก) <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                                                name="phone"
                                                                value={formData.phone}
                                                                onChange={handleChange}
                                                                placeholder="หมายเลขโทรศัพท์"
                                                                maxLength="10"
                                                            />
                                                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">อีเมล <span className="text-danger">*</span></label>
                                                            <input
                                                                type="email"
                                                                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                                                name="email"
                                                                value={formData.email}
                                                                onChange={handleChange}
                                                                placeholder="example@email.com"
                                                            />
                                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div> */}

                                <div className="alert alert-info border-0 d-flex align-items-center">
                                    <AlertCircle size={20} className="me-2 mt-1 flex-shrink-0" />
                                    <div>
                                        <strong>หมายเหตุ:</strong> การบริจาคแบบ Walk-in จะถูกบันทึกเป็นสถานะ "ชำระแล้ว" โดยอัตโนมัติ
                                        และสามารถออกใบเสร็จรับเงินได้ทันที
                                    </div>
                                </div>

                                <div className="d-flex justify-content-center gap-2 mt-4 pt-3 border-top">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                        onClick={handleReset}
                                        disabled={loading}
                                    >
                                        ล้างฟอร์ม
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary d-flex align-items-center justify-content-center"
                                        style={{ backgroundColor: '#0F75BC', borderColor: '#0F75BC' }}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} className="me-2" />
                                                บันทึกการบริจาค
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WalkInDonationForm;