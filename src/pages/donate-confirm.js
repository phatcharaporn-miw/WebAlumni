import { useLocation, useNavigate, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/Donate-detail.css";
import { MdDateRange } from "react-icons/md";
import { ImUser } from "react-icons/im";
import { IoInformationCircleOutline } from "react-icons/io5";

function DonateConfirm() {

    const location = useLocation();
    const navigate = useNavigate();
    const [Data, setProjectData] = useState({});
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

    const extractAmountFromText = (text) => {
        if (!text) return null;
        const match = text.match(/(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?/);
        return match ? match[0].replace(/,/g, "") : null;
    };

    const extractDateFromText = (text) => {
        if (!text) return null;
        const isoDate = text.match(/\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/);
        if (isoDate) return isoDate[0];
        const dmyDate = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
        return dmyDate ? dmyDate[0] : null;
    };

    useEffect(() => {
        console.log("OCR Text:", formData?.ocrText);
        if (formData?.ocrText) {
            const parsed = parseOcrText(formData.ocrText);
            console.log("Parsed OCR:", parsed);
            setOcrParsed(parsed);
            setOcrAmount(extractAmountFromText(formData.ocrText));
            setOcrDate(extractDateFromText(formData.ocrText));
        }
    }, [formData]);


    if (!formData) {
        return <p>ไม่มีข้อมูล กรุณากลับไปกรอกฟอร์ม</p>;
    }

    const handleConfirm = async () => {
        const Data = new FormData();
        Data.append("amount", formData.amount);
        Data.append("userId", formData.user_id || "1");
        Data.append("projectId", projectId);

        if (formData.file) {
            Data.append("slip", formData.file);
        } else {
            alert("กรุณาเลือกไฟล์รูปภาพ");
            return;
        }

        const form = new FormData();
        form.append("amount", formData.amount);
        form.append("userId", formData.user_id);
        form.append("projectId", projectId);
        form.append("slip", formData.file);

        if (showTaxForm) {
            Data.append("name", formData.name);
            Data.append("address", formData.address);
            Data.append("taxId", formData.taxId);
        } else {
            Data.append("name", "");
            Data.append("address", "");
            Data.append("taxId", "");
        }

        try {
            await axios.post('http://localhost:3001/donate/donation/', Data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert("ขอบคุณสำหรับการบริจาคของคุณ!");
            navigate("/alumni-profile/donation-history");
            
        } catch (error) {
            alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        } finally {
            setLoading(false);
        }
    };


    const progressPercent = projectData.target_amount
        ? (projectData.current_amount / projectData.target_amount) * 100
        : 0;

    return (
        <>
            <h3>ยืนยันการบริจาค</h3>
            <div className="donate-confirm-content">
                <div className="donate-confirm-content-item">
                    <h5>{projectData.project_name}</h5>
                    <img
                        src={`http://localhost:3001/uploads/${projectData.image_path}`}
                        alt="กิจกรรม"
                        onError={(e) => {
                            e.target.src = `${process.env.PUBLIC_URL}/image/default.png`;
                        }}
                    />

                    <div className="donate-detail-bar">
                        <div className="donate-detail-progress-bar-container">
                            <div
                                className="donate-detail-progress-bar"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                            <span className="donate-detail-progress-percent">
                                {`${progressPercent.toFixed(0)}%`}
                            </span>
                        </div>
                    </div>

                    <div className="donate-detail-details">
                        <span>ยอดบริจาคปัจจุบัน:{" "}
                            <span className="donate-detail-details-bold">
                                {new Intl.NumberFormat().format(projectData.current_amount)} บาท
                            </span>
                        </span>
                        <span>เป้าหมาย:{" "}
                            <span className="donate-detail-details-bold">
                                {new Intl.NumberFormat().format(projectData.target_amount)} บาท
                            </span>
                        </span>
                    </div>

                    <div className="donate-detail-discription-day">
                        <span>เหลืออีก {daysLeft} วัน</span>
                    </div>

                    <div className="donate-detail-discription">
                        <div className="donate-detail-header">
                            <IoInformationCircleOutline className="custom-icon" />
                            <p>รายละเอียดโครงการ</p>
                        </div>
                        <p className="donate-detail-informations">{projectData.description}</p>
                    </div>

                    <div className="donate-detail-discription">
                        <div className="donate-detail-header">
                            <MdDateRange className="custom-icon" />
                            <p>ระยะเวลาระดมทุน</p>
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

                {/* ส่วนยืนยัน */}
                <div className="donate-confirm-content-item">
                    <p><strong>จำนวนเงิน (จากแบบฟอร์ม):</strong> {formData.amount} บาท</p>

                    {formData.file && (
                        <img src={URL.createObjectURL(formData.file)} alt="สลิป" width="200" />
                    )}

                    <button className="cancle-button" onClick={() => navigate(-1)} disabled={loading}>
                        ยกเลิก
                    </button>
                    <button onClick={handleConfirm} disabled={loading}>
                        {loading ? "กำลังยืนยัน..." : "ยืนยันการบริจาค"}
                    </button>
                </div>
            </div>
        </>
    );
}

export default DonateConfirm;
