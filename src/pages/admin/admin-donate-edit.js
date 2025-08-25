import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function AdminEditProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const location = useLocation();

    const [formData, setFormData] = useState({
        project_name: '',
        description: '',
        target_amount: '',
        donation_type: '',
        start_date: '',
        end_date: '',
        current_amount: '',
        bank_name: '',
        account_number: '',
        number_promtpay: '',
        image: null,
        status: '1',
        account_name: '',
        type_things: '',
        quantity_things: '',
        for_things: ''
    });

    // ดึงข้อมูลโครงการที่จะแก้ไข
    useEffect(() => {
        const fetchProject = async () => {
            try {
                console.log('Fetching project with ID:', id);
                const response = await axios.get(`http://localhost:3001/admin/donatedetail/${id}`);
                const project = response.data;

                setFormData({
                    project_name: project.project_name || '',
                    description: project.description || '',
                    target_amount: project.target_amount || '',
                    donation_type: project.donation_type || '',
                    start_date: project.start_date ? project.start_date.split('T')[0] : '',
                    end_date: project.end_date ? project.end_date.split('T')[0] : '',
                    current_amount: project.current_amount || '0',
                    bank_name: project.bank_name || '',
                    account_number: project.account_number || '',
                    account_name: project.account_name || '',
                    number_promtpay: project.number_promtpay || '',
                    image: null,
                    status: project.status || '1',
                    type_things: project.type_things || '',
                    quantity_things: project.quantity_things || '',
                    for_things: project.for_things || ''
                });

                if (project.image_path) {
                    setOriginalImage(project.image_path);
                    setImagePreview(`http://localhost:3001/uploads/${project.image_path}`);
                }

                setLoading(false);
            } catch (error) {
                setError('ไม่พบโครงการที่ต้องการแก้ไข');
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // ตรวจสอบชนิดไฟล์
            if (!file.type.startsWith('image/')) {
                alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
                return;
            }

            setFormData(prev => ({
                ...prev,
                image: file
            }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ลบรูปภาพ
    const handleRemoveImage = () => {
        setFormData(prev => ({
            ...prev,
            image: null
        }));
        setImagePreview(null);
        document.getElementById('imageInput').value = '';
    };

    //ยกเลิก
    const handleCancel = () => {
        if (window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการแก้ไข?')) {
            navigate('/admin/donations');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //ตรวจสอบข้อมูลพื้นฐาน
        if (!formData.project_name.trim()) {
            alert('กรุณากรอกชื่อโครงการ');
            return;
        }
        if (!formData.description.trim()) {
            alert('กรุณากรอกรายละเอียดโครงการ');
            return;
        }
        if (formData.donation_type === 'money' && !formData.target_amount) {
            alert('กรุณากรอกเป้าหมายเงินบริจาค');
            return;
        }
        if (!formData.start_date || !formData.end_date) {
            alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
            return;
        }
        if (new Date(formData.start_date) >= new Date(formData.end_date)) {
            alert('วันที่เริ่มต้นต้องก่อนวันที่สิ้นสุด');
            return;
        }
        setSaving(true);
        try {
            const submitData = new FormData();
            submitData.append('project_name', formData.project_name);
            submitData.append('description', formData.description);
            submitData.append('target_amount', formData.target_amount || 0);
            submitData.append('donation_type', formData.donation_type);
            submitData.append('start_date', formData.start_date);
            submitData.append('end_date', formData.end_date);
            // submitData.append('status', formData.status);
            submitData.append('status', '');
            submitData.append('current_amount', formData.current_amount || 0);
            submitData.append('bank_name', formData.bank_name);
            submitData.append('account_number', formData.account_number);
            submitData.append('account_name', formData.account_name);
            submitData.append('number_promtpay', formData.number_promtpay);

            if (formData.image) {
                submitData.append('image', formData.image);
            }

            const response = await axios.put(`http://localhost:3001/admin/editDonate/${id}`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                alert('แก้ไขโครงการสำเร็จ');
                navigate('/admin/donations');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            alert(error.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขโครงการ');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="donate-activity-container">
            <div className="mb-4">
                <nav className="nav Adminnav-tabs">
                    <Link
                        className={`adminnav-link ${location.pathname.startsWith('/admin/donations') ? 'active' : ''}`}
                        to="/admin/donations"
                    >
                        <i className="fas fa-project-diagram me-2"></i>
                        การจัดการโครงการบริจาค
                    </Link>

                    <Link
                        className={`adminnav-link ${location.pathname === '/admin/donations/check-payment-donate' ? 'active' : ''}`}
                        to="/admin/donations/check-payment-donate"
                    >
                        <i className="fas fa-credit-card me-2"></i>
                        การจัดการตรวจสอบการชำระเงินบริจาค
                    </Link>
                </nav>
            </div>
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="px-0">
                        <div className="card shadow">
                            <div className="card-header-editDonate text-white">
                                <h4 className="mb-0">
                                    <i className="fas fa-edit"></i> แก้ไขโครงการ
                                </h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="data-AdminEditDonate">
                                        {/* รูปภาพปัจจุบันและเลือกใหม่ */}
                                        <div className="mb-3">
                                            <label className="data-AdminEditDonate-label">
                                                <i className="fas fa-image me-2"></i> รูปภาพประกอบโครงการ
                                            </label>
                                            <div className="upload-image-box p-3 border rounded bg-light text-center">
                                                {imagePreview ? (
                                                    <div>
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="img-fluid rounded shadow-sm mb-2"
                                                            style={{ maxHeight: '250px', objectFit: 'cover' }}
                                                        />
                                                        <div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={handleRemoveImage}
                                                            >
                                                                <i className="fas fa-trash-alt"></i> ลบรูปภาพ
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted mb-2">
                                                        <i className="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                                                        <p className="m-0">ยังไม่ได้เลือกรูปภาพ</p>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    className="form-control mt-3"
                                                    id="imageInput"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </div>
                                        </div>

                                    </div>

                                    <div className="data-AdminEditDonate">
                                        {/* ชื่อโครงการ */}

                                        <p>
                                            <label className="data-AdminEditDonate-label">
                                                ชื่อโครงการ <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="project_name"
                                                value={formData.project_name}
                                                onChange={handleInputChange}
                                                placeholder="กรอกชื่อโครงการ"
                                                required
                                            />
                                        </p>
                                        <p>
                                            <label className="data-AdminEditDonate-label">
                                                รายละเอียดโครงการ <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                rows="5"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="กรอกรายละเอียดโครงการ"
                                                required
                                            />
                                        </p>
                                        {/* ประเภทการบริจาค */}
                                        <div className="col-md-12 mb-3">
                                            <label className="data-AdminEditDonate-label">
                                                ประเภทการบริจาค <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select"
                                                name="donation_type"
                                                value={formData.donation_type}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="things">สิ่งของ</option>
                                                <option value="fundraising">บริจาคแบบระดมทุน</option>
                                                <option value="unlimited">บริจาคแบบไม่จำกัดจำนวน</option>
                                            </select>
                                        </div>
                                        {(formData.donation_type === 'fundraising' || formData.donation_type === 'unlimited') && (
                                            <div className="row">
                                                {/* เป้าหมายเงิน */}
                                                <div className="col-md-6 mb-3">
                                                    <label className="data-AdminEditDonate-label">
                                                        เป้าหมายเงินบริจาค (บาท) <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="target_amount"
                                                        value={formData.target_amount}
                                                        onChange={handleInputChange}
                                                        placeholder="กรอกเป้าหมายเงินบริจาค"
                                                        // min="1"
                                                        required
                                                    />
                                                </div>

                                                {/* ยอดปัจจุบัน */}
                                                <div className="col-md-6 mb-3">
                                                    <label className="data-AdminEditDonate-label">
                                                        ยอดบริจาคปัจจุบัน (บาท)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="current_amount"
                                                        value={formData.current_amount}
                                                        onChange={handleInputChange}
                                                        placeholder="ยอดบริจาคปัจจุบัน"
                                                        min="0"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/*เป็นสิ่งของ*/}
                                        {formData.donation_type === 'things' && (
                                            <>
                                                <div className="mb-3">
                                                    <label className="data-AdminEditDonate-label">
                                                        รายการสิ่งของที่ต้องการ <span className="text-danger">*</span>
                                                    </label>
                                                    <select
                                                        className="form-select"
                                                        name="type_things"
                                                        value={formData.type_things}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="อุปกรณ์การเรียน">อุปกรณ์การเรียน</option>
                                                        <option value="เครื่องคอมพิวเตอร์">เครื่องคอมพิวเตอร์</option>
                                                    </select>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label className="data-AdminEditDonate-label">
                                                            จำนวนสิ่งของ <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            name="quantity_things"
                                                            value={formData.quantity_things}
                                                            onChange={handleInputChange}
                                                            placeholder="จำนวนสิ่งของที่ต้องการ"
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div className="col-md-6 mb-3">
                                                        <label className="data-AdminEditDonate-label">
                                                            บริจาคให้กับ <span className="text-danger">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="for_things"
                                                            value={formData.for_things}
                                                            onChange={handleInputChange}
                                                            placeholder="ชื่อผู้รับบริจาค"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="row">
                                            {/* แสดงข้อความเตือนถ้าโครงการสิ้นสุดแล้ว */}
                                            {formData.status === '3' && (
                                                <div className="col-12 mb-3">
                                                    <div className="alert alert-warning">
                                                        โครงการนี้ได้สิ้นสุดลงแล้ว ไม่สามารถแก้ไขวันที่สิ้นสุดได้
                                                    </div>
                                                </div>
                                            )}

                                            {/* วันที่เริ่มต้น */}
                                            <div className="col-md-6 mb-3">
                                                <label className="data-AdminEditDonate-label">
                                                    วันที่เริ่มต้น <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="start_date"
                                                    value={formData.start_date}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            {/* วันที่สิ้นสุด */}
                                            <div className="col-md-6 mb-3">
                                                <label className="data-AdminEditDonate-label">
                                                    วันที่สิ้นสุด
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    name="end_date"
                                                    value={formData.end_date}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={formData.status === '3'} // ปิดการแก้ไข
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-AdminEditDonate">
                                        {/* ข้อมูลธนาคาร */}
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="data-AdminEditDonate-label">
                                                    ชื่อธนาคาร
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bank_name"
                                                    value={formData.bank_name}
                                                    onChange={handleInputChange}
                                                    placeholder="กรอกชื่อธนาคาร"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="data-AdminEditDonate-label">
                                                    ชื่อบัญชีธนาคาร
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="account_name"
                                                    value={formData.account_name}
                                                    onChange={handleInputChange}
                                                    placeholder="กรอกชื่อธนาคาร"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="data-AdminEditDonate-label">
                                                    เลขบัญชี
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="account_number"
                                                    value={formData.account_number}
                                                    onChange={handleInputChange}
                                                    placeholder="กรอกเลขบัญชี"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="data-AdminEditDonate-label">
                                                    หมายเลข PromptPay
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="number_promtpay"
                                                    value={formData.number_promtpay}
                                                    onChange={handleInputChange}
                                                    placeholder="กรอกหมายเลข PromptPay (ถ้ามี)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-AdminEditDonate">
                                        {/* สถานะโครงการ */}
                                        <div className="mb-3">
                                            <label className="data-AdminEditDonate-label">สถานะโครงการ</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="0">ยังไม่อนุมัติ</option>
                                                <option value="1">อนุมัติแล้ว</option>
                                                <option value="3">สิ้นสุด</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* ปุ่มจัดการ */}
                                    <div className="group-donate-btAdmin" >
                                        <button
                                            type="button"
                                            className="cancle-button-editAdmin"
                                            onClick={handleCancel}
                                        >
                                            <i className="fas fa-times"></i> ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="submit-button-editAdmin"
                                        >
                                            <i className="fas fa-save"></i> บันทึกการแก้ไข
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}

export default AdminEditProject;