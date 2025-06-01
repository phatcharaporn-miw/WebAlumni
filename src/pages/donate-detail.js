import React, { useState, useEffect, useCallback } from "react";
import "../css/Donate-detail.css";
import { MdDateRange } from "react-icons/md";
import { ImUser } from "react-icons/im";
import { BiScan } from "react-icons/bi";
import { IoInformationCircleOutline } from "react-icons/io5";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function DonateDetail() {
    const { projectId } = useParams();
    const [projectData, setProjectData] = useState({});
    const [showTaxForm, setShowTaxForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        user_id: "",
        project_id: "",
        slip: null,
        name: "",
        address: "",
        taxId: ""
    });
    const [qrCode, setQrCode] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:3001/donate/donatedetail/${projectId}`,{
            withCredentials: true
        })
            .then(response => {
                // console.log("Project Data:", response.data);
                setProjectData(response.data);
            })
            .catch(error => {
                console.error('Error fetching project data:', error);
                alert("เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ");
            });
    }, [projectId]);

    // ฟังก์ชันที่ใช้ในการสร้าง QR Code
    const generateQRCode = useCallback(() => {
        if (!formData.amount || !projectData.number_promtpay) {
            console.log('Missing amount or PromptPay number:', formData.amount, projectData.number_promtpay);
            return;
        }
        axios.post('http://localhost:3001/donate/generateQR', {
            amount: parseFloat(formData.amount),
            numberPromtpay: projectData.number_promtpay
        },{
            withCredentials: true
        })
            .then(response => {
                if (response.data.Result) {
                    setQrCode(response.data.Result);
                }
            })
            .catch(error => {
                console.error('Error generating QR code:', error);
            });
    }, [formData.amount, projectData.number_promtpay]);

    useEffect(() => {
        if (formData.amount) {
            generateQRCode();
        } else {
            setQrCode(null);
        }
    }, [formData.amount, generateQRCode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file && file.size > 5 * 1024 * 1024) {
            alert("ขนาดไฟล์ไม่เกิน 5MB");
            return;
        }

        // ไฟล์ (เฉพาะ .jpg, .png, .pdf)
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (file && !allowedTypes.includes(file.type)) {
            alert("กรุณาเลือกไฟล์ .jpg, .png หรือ .pdf เท่านั้น");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            file: file,
        }));
    };

    // ภาษี
    const handleTaxOptionChange = (e) => {
        setShowTaxForm(e.target.value === "yes");
    };
    // กรอกฟอร์มบริจาค
    const handleSubmit = async (e) => {
        e.preventDefault();

        const Data = new FormData();

        Data.append("amount", formData.amount);
        Data.append("userId", formData.user_id || "1");
        Data.append("projectId", projectId);

        if (formData.file) {
            Data.append("slip", formData.file);
        } else {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (showTaxForm) {
            Data.append("name", formData.name);
            Data.append("address", formData.address);
            Data.append("taxId", formData.taxId);
        } else {
            Data.append("name", "");
            Data.append("address", "");
            Data.append("taxId", "");
        }
        navigate(`/donate/donatedetail/donateconfirm/${projectData.project_id}`, { state: { formData, projectId, showTaxForm } });
    };

    const startDate = projectData?.start_date ? new Date(projectData.start_date) : null;
    const endDate = projectData?.end_date ? new Date(projectData.end_date) : null;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const formattedStartDate = startDate ? startDate.toLocaleDateString('th-TH', options) : "-";
    const formattedEndDate = endDate ? endDate.toLocaleDateString('th-TH', options) : "-";

    const countDay = startDate && endDate ? (endDate - startDate) / (1000 * 3600 * 24) : 0;
    const progress = projectData.target_amount
        ? (projectData.current_amount / projectData.target_amount) * 100
        : 0;
    return (<>
        <div className="donate-detail-content">
            <div className="donate-detail-content-item">
                <h5>{projectData.project_name}</h5>
                <img
                    src={`http://localhost:3001/uploads/${projectData.image_path}`}
                    alt="กิจกรรม"
                    onError={(e) => {
                        e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                    }}
                />

                <div className="donate-detail-progress">
                    {
                        projectData.target_amount && projectData.target_amount > 0
                            ? `${((projectData.current_amount / projectData.target_amount) * 100).toFixed(2)}%`
                            : " "
                    }
                </div>

                <div className="bar">
                    {(projectData.donation_type !== "unlimited" && projectData.donation_type !== "things") && (
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{ width: `${progress ? progress.toFixed(0) : 0}%` }}
                            >
                                <span className="progress-percent">
                                    {`${progress ? progress.toFixed(0) : 0}%`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ข้อมูลยอดเงินเป้าหมาย */}
                <div className="donate-detail-details">
                    <span>ยอดบริจาคปัจจุบัน: {projectData.current_amount ? projectData.current_amount.toLocaleString() : "0"} บาท</span>
                    {projectData.donation_type !== "unlimited" && projectData.donation_type !== "things" && projectData.target_amount > 0 && (
                        <span>เป้าหมาย: {projectData.target_amount ? projectData.target_amount.toLocaleString() : "0"} บาท</span>
                    )}
                </div>

                {/* แสดงจำนวนวันที่เหลือ */}
                <div className="donate-detail-discription-day">
                    <span>เหลืออีก {countDay} วัน</span>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <IoInformationCircleOutline className="custom-icon" />
                        <p>รายละเอียดโครงการ</p>
                    </div>
                    <div className ="donate-detail-informations">
                        {/* {formattedStartDate} - {formattedEndDate} */}
                        <p>{projectData.description}</p>
                    </div>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <MdDateRange className="custom-icon" />
                        <p>ระยะเวลาระดุมทุน</p>
                    </div>
                    <p className="donate-detail-informations">
                        {formattedStartDate} - {formattedEndDate}
                    </p>
                </div>

                <div className="donate-detail-discription">
                    <div className="donate-detail-header">
                        <ImUser className="custom-icon" />
                        <p>ผู้รับผิดชอบโครงการ</p>
                    </div>
                    <p className="donate-detail-informations">{projectData.user_id}</p>
                </div>
            </div>

            {/* ฟอร์มบริจาค */}
            <div className="donate-detail-content-item">
                <form onSubmit={handleSubmit}>
                    <div className="donate-detail-form-items-amount">
                        <label className="title-label" htmlFor="amount">ระบุจำนวนเงิน</label>
                        <br />
                        <input
                            type="text"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="กรอกจำนวนเงิน"
                        />
                    </div>

                    {/* QR Code สำหรับ PromptPay */}
                    <div className="donate-detail-form-items">
                        <label className="title-label">ช่องทางการชำระเงิน</label>
                        <div className="group-promptPay-layout">
                            <div className="title-promptPay-layout">
                                <p><BiScan className="custom-icon" />QR PromptPay</p>
                                <img src={`${process.env.PUBLIC_URL}/image/PromptPay-logo.png`} alt="PromptPay logo" style={{ width: "70px", height: "38px", objectFit: "cover" }} />
                            </div>
                            <div className="promptPay-layout">
                                {qrCode && <img src={qrCode} alt="QR Code สำหรับการชำระเงิน" style={{ width: "200px", height: "200px", objectFit: "contain" }} />}
                            </div>
                        </div>
                    </div>

                    <div className="donate-detail-form-items">
                        <label className="title-label" htmlFor="slip">หลักฐานการชำระเงิน</label>
                        <input
                            type="file"
                            className="slip"
                            id="slip"
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png, .pdf"
                        />
                    </div>

                    <div className="donate-detail-form-items">
                        <label className="title-label">ใบกำกับภาษี</label>
                        <div className="tax-options">
                            <label>
                                <input
                                    type="radio"
                                    id="no-tax"
                                    name="tax"
                                    value="no"
                                    onChange={handleTaxOptionChange}
                                />
                                <p className="tax-options-text">ไม่ต้องการ</p>
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    id="want-tax"
                                    name="tax"
                                    value="yes"
                                    onChange={handleTaxOptionChange}
                                />
                                <p className="tax-options-text"> ต้องการ</p>
                            </label>
                        </div>
                    </div>

                    {showTaxForm && (
                        <div className="donate-detail-tax-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="ชื่อบริษัท/นิติบุคคล*"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="ที่อยู่*"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    id="taxId"
                                    name="taxId"
                                    value={formData.taxId}
                                    onChange={handleInputChange}
                                    placeholder="เลขประจำตัวผู้เสียภาษี*"
                                />
                            </div>
                        </div>
                    )}
                    <button className="donate-detail-button-submit" onClick={handleSubmit}>บริจาค</button>
                </form>
            </div>
        </div>
    </>
    );
}

export default DonateDetail;