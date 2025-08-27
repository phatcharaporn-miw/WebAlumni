import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
        status: '0'
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
                    number_promtpay: project.number_promtpay || '',
                    image: null,
                    status: project.status || '0'
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
        // if (window.confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการแก้ไข?')) {
            navigate('/admin/donations');
        // }
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

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">กำลังโหลด...</span>
                    </div>
                    <p className="mt-2">กำลังโหลดข้อมูลโครงการ...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
                    <p>{error}</p>
                    <button
                        className="btn btn-outline-danger"
                        onClick={() => navigate('/admin/donations')}
                    >
                        กลับหน้าจัดการโครงการ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card shadow">
                        {/* Header */}
                        <div className="card-header bg-warning text-white">
                            <h4 className="mb-0">
                                <i className="fas fa-edit me-2"></i> แก้ไขโครงการ
                            </h4>
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {/* รูปภาพประกอบโครงการ */}
                                <div className="mb-4">
                                    <label className="form-label">รูปภาพประกอบโครงการ</label>
                                    {imagePreview && (
                                        <div className="mb-2 text-center">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-thumbnail"
                                                style={{ maxHeight: '200px' }}
                                            />
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger"
                                                    onClick={handleRemoveImage}
                                                >
                                                    ลบรูปภาพ
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="form-control w-100"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>


                                {/* ชื่อโครงการ และ ประเภทการบริจาค */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            ชื่อโครงการ <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control w-100"
                                            name="project_name"
                                            value={formData.project_name}
                                            onChange={handleInputChange}
                                            placeholder="กรอกชื่อโครงการ"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            ประเภทการบริจาค <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select w-100 mt-2"
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
                                </div>

                                {/* รายละเอียดโครงการ */}
                                <div className="mb-4">
                                    <label className="form-label">
                                        รายละเอียดโครงการ <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className="form-control w-100"
                                        name="description"
                                        rows="5"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="กรอกรายละเอียดโครงการ"
                                        required
                                    />
                                </div>

                                {/* เป้าหมายเงินบริจาค และ ยอดปัจจุบัน */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            เป้าหมายเงินบริจาค (บาท) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control w-100"
                                            name="target_amount"
                                            value={formData.target_amount}
                                            onChange={handleInputChange}
                                            placeholder="กรอกเป้าหมายเงินบริจาค"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">ยอดบริจาคปัจจุบัน (บาท)</label>
                                        <input
                                            type="number"
                                            className="form-control w-100"
                                            name="current_amount"
                                            value={formData.current_amount}
                                            readOnly
                                            min="0"
                                            placeholder="ยอดบริจาคปัจจุบัน"
                                        />
                                    </div>
                                </div>

                                {/* วันที่เริ่มต้นและวันที่สิ้นสุด */}
                                {formData.status === '3' && (
                                    <div className="alert alert-warning">
                                        โครงการนี้ได้สิ้นสุดลงแล้ว ไม่สามารถแก้ไขวันที่สิ้นสุดได้
                                    </div>
                                )}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            วันที่เริ่มต้น <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control w-100"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            วันที่สิ้นสุด <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control w-100"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                            required
                                            disabled={formData.status === '3'}
                                        />
                                    </div>
                                </div>

                                {/* ข้อมูลธนาคาร */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            ชื่อธนาคาร <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control w-100"
                                            name="bank_name"
                                            value={formData.bank_name}
                                            onChange={handleInputChange}
                                            placeholder="กรอกชื่อธนาคาร"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            เลขบัญชี <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control w-100"
                                            name="account_number"
                                            value={formData.account_number}
                                            onChange={handleInputChange}
                                            placeholder="กรอกเลขบัญชี"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* PromptPay */}
                                <div className="mb-4">
                                    <label className="form-label">หมายเลข PromptPay</label>
                                    <input
                                        type="text"
                                        className="form-control w-50"
                                        name="number_promtpay"
                                        value={formData.number_promtpay}
                                        onChange={handleInputChange}
                                        placeholder="กรอกหมายเลข PromptPay (ถ้ามี)"
                                    />
                                </div>

                                {/* ปุ่มจัดการ */}
                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                    >
                                        ยกเลิก
                                    </button>
                                    <button type="submit" className="btn btn-success">
                                        บันทึกการแก้ไข
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

export default AdminEditProject;