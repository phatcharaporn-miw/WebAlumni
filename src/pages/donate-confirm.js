import { useLocation, useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Donate-confirm.css";
import { MdDateRange, MdAttachMoney, MdReceipt } from "react-icons/md";
import { IoInformationCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline } from "react-icons/io5";
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaBuilding, FaFileImage } from "react-icons/fa";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

function DonateConfirm() {
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(false);
    const [projectData, setProjectData] = useState({});
    const [error, setError] = useState(null);
    const [isDataValid, setIsDataValid] = useState(false);
    const userId = localStorage.getItem("userId");
    const location = useLocation();
    const navigate = useNavigate();
    // const [Data, setProjectData] = useState({});
    const { formData, projectId, showTaxForm } = location.state || {};
    
    const startDate = Data?.start_date ? new Date(Data.start_date) : null;
    const endDate = Data?.end_date ? new Date(Data.end_date) : null;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const formattedStartDate = startDate ? startDate.toLocaleDateString('th-TH', options) : "-";
    const formattedEndDate = endDate ? endDate.toLocaleDateString('th-TH', options) : "-";

    const countDay = startDate && endDate ? (endDate - startDate) / (1000 * 3600 * 24) : 0;

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`http://localhost:3001/donate/donatedetail/${projectId}`)
            .then(response => {
                console.log("Project Data:", response.data);
                setProjectData(response.data);
            })
            .catch(error => {
                console.error('Error fetching project data:', error);
                alert("เกิดข้อผิดพลาดในการโหลดข้อมูลโครงการ");
            });
    }, [projectId]);

    if (!formData) {
        return <p>ไม่มีข้อมูล กรุณากลับไปกรอกฟอร์ม</p>;
    }

    const handleConfirm = async () => {
        if (!isDataValid) {
            alert("กรุณาตรวจสอบข้อมูลให้ครบถ้วน");
            return;
        }

        if (!userId) {
            alert("กรุณาเข้าสู่ระบบก่อนทำการบริจาค");
            navigate("/login");
            return;
        }

        const form = new FormData();
        form.append("amount", formData.amount);
        form.append("userId", formData.user_id);
        form.append("projectId", projectId);
        form.append("slip", formData.file);

        if (daysLeft <= 0) {
            alert("โครงการนี้หมดเขตการบริจาคแล้ว");
            return;
        }

        const confirmMessage = `คุณต้องการยืนยันการบริจาค จำนวน ${new Intl.NumberFormat('th-TH').format(formData.amount)} บาท ให้โครงการ "${projectData.project_name}" หรือไม่?`;

        if (!window.confirm(confirmMessage)) return;

        setLoading(true);

        try {
            const donationData = new FormData();
            donationData.append("amount", formData.amount);
            donationData.append("userId", userId); // <-- แก้จาก formData.userId
            donationData.append("projectId", projectId);

            if (file) {
                donationData.append("slip", file); // Multer จะรับได้
            }

            if (useTax) {
                donationData.append("useTax", "1");
                donationData.append("type_tax", formData.type_tax);

                if (formData.useExistingTax && formData.taxId) {
                    // ใช้ tax record ที่มีอยู่
                    donationData.append("useExistingTax", "1");
                    donationData.append("taxId", formData.taxId);
                } else {
                    // สร้าง tax record ใหม่
                    donationData.append("useExistingTax", "0");
                    if (formData.type_tax === "individual") {
                        donationData.append("name", formData.name || ""); // backend ใช้ field name
                        donationData.append("tax_number", formData.tax_number || "");
                        donationData.append("phone", formData.phone || "");
                        donationData.append("email", formData.email || "");
                    } else if (formData.type_tax === "corporate") {
                        donationData.append("name", formData.company_name || "");
                        donationData.append("tax_number", formData.tax_number || "");
                        donationData.append("phone", formData.phone || "");
                        donationData.append("email", formData.email || "");
                    }
                }
            } else {
                donationData.append("useTax", "0");
            }

            if (formData.useExistingTax && formData.taxId) {
                donationData.append("useExistingTax", "1");
                donationData.append("taxId", formData.taxId);
            }

            const response = await axios.post(`http://localhost:3001/donate/donation`, donationData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert("บริจาคสำเร็จ!");
            navigate("/donate");
        } catch (error) {
            alert(error.response?.data?.error || "เกิดข้อผิดพลาด");
        }
    };


    const progressPercent = projectData.target_amount
        ? (projectData.current_amount / projectData.target_amount) * 100
        : 0;

    return (<>
        <h3>ยืนยันการบริจาค</h3>
        <div className="donate-confirm-content">
            <div className="donate-confirm-content-item">
                <h5>{Data.project_name}</h5>
                <img
                    src={`http://localhost:3001/uploads/${Data.image_path}`}
                    alt="กิจกรรม"
                    onError={(e) => {
                        e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                    }}
                />

                <div className="donate-detail-progress">
                    {
                        Data.target_amount && Data.target_amount > 0
                            ? `${((Data.current_amount / Data.target_amount) * 100).toFixed(2)}%`
                            : " "
                    }
                </div>

                <div className="donate-detail-bar">
                    <div className="donate-detail-progress-bar-container">
                        <div
                            className="donate-detail-progress-bar"
                            style={{ width: `${(Data.current_amount / Data.target_amount) * 100}%` }}
                        ></div>
                        <span className="donate-detail-progress-percent">
                            {`${((Data.current_amount / Data.target_amount) * 100).toFixed(0)}%`}
                        </span>
                    </div>
                </div>

                {/* ข้อมูลยอดเงินเป้าหมาย */}
                <div className="donate-detail-details">
                    <span>
                        ยอดบริจาคปัจจุบัน: <span className="donate-detail-details-bold">{new Intl.NumberFormat('en-US').format(Data.current_amount)}</span> บาท
                    </span>
                    <span>
                        เป้าหมาย: <span className="donate-detail-details-bold">{new Intl.NumberFormat('en-US').format(Data.target_amount)}</span> บาท
                    </span>
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
                    <p className="donate-detail-informations">
                        <p>{Data.description}</p>
                    </p>
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
                    <p className="donate-detail-informations">{Data.user_id}</p>
                </div>
            </div>

            <div className="donate-confirm-content-item">
                <p>จำนวนเงิน: {formData.amount} บาท</p>
                <p>ชื่อผู้บริจาค: {formData.name || "ไม่ระบุ"}</p>
                {formData.file && <img src={URL.createObjectURL(formData.file)} alt="สลิป" width="200" />}
                <button className="cancle-button" type="button" onClick={() => navigate(-1)}>
                    ยกเลิก
                </button>
                <button onClick={handleConfirm}>ยืนยัน</button>
            </div>

        </div>
    </>
    );
}

export default DonateConfirm;