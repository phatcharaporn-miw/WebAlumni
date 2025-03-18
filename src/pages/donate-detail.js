import React, { useState, useEffect } from "react";
import "../css/Donate-detail.css";
import { MdDateRange } from "react-icons/md";
import { ImUser } from "react-icons/im";
import axios from "axios";
import { useParams } from "react-router-dom";

function DonateDetail() {
    const { projectId } = useParams();
    const [projectData, setProjectData] = useState(null);
    const [showTaxForm, setShowTaxForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        name: "",
        address: "",
        taxId: "",
        file: null,
    });
    const [qrCode, setQrCode] = useState(null);

    // ฟังก์ชันที่ใช้ในการสร้าง QR Code
    const generateQRCode = () => {
        if (!formData.amount) return;
        axios.post('http://localhost:3001/generateQR', {
            amount: parseFloat(formData.amount),
        })
            .then(response => {
                if (response.data.Result) {
                    setQrCode(response.data.Result);
                }
            })
            .catch(error => {
                console.error('Error generating QR code:', error);
            });
    };

    useEffect(() => {
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


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            file: e.target.files[0],
        }));
    };

    const handleTaxOptionChange = (e) => {
        setShowTaxForm(e.target.value === "yes");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount) {
            alert("กรุณาระบุจำนวนเงินบริจาค");
            return;
        }
        if (showTaxForm && (!formData.name || !formData.address || !formData.taxId)) {
            alert("กรุณากรอกข้อมูลใบกำกับภาษีให้ครบถ้วน");
            return;
        }
        alert("ส่งข้อมูลสำเร็จ!");
    };

    if (!projectData) return <p>กำลังโหลดข้อมูลโครงการ...</p>;

    const startDate = new Date(projectData.start_date);
    const endDate = new Date(projectData.end_date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    const formattedStartDate = startDate.toLocaleDateString('th-TH', options);
    const formattedEndDate = endDate.toLocaleDateString('th-TH', options);

    const count_day = endDate - startDate;
    const countDay = count_day / (1000 * 3600 * 24);

    return (
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
                
                {/* แสดงข้อมูลยอดบริจาคและเปอร์เซ็นต์ */}
                <div className="donate-detail-progress">
                    {
                        projectData.target_amount && projectData.target_amount > 0
                            ? `ยอดบริจาค: ${projectData.current_amount.toLocaleString()} บาท (${((projectData.current_amount / projectData.target_amount) * 100).toFixed(2)}%)`
                            : `ยอดบริจาค: ${projectData.current_amount.toLocaleString()} บาท`
                    }
                </div>
                <div className="donate-detail-bar">
                    <div className="donate-detail-progress-bar-container">
                        <div
                            className="donate-detail-progress-bar"
                            style={{ width: `${(projectData.current_amount / projectData.target_amount) * 100}%` }}
                        ></div>
                        <span className="donate-detail-progress-percent">
                            {`${((projectData.current_amount / projectData.target_amount) * 100).toFixed(0)}%`}
                        </span>
                    </div>
                </div>

                {/* ข้อมูลยอดเงินเป้าหมาย */}
                <div className="donate-detail-details">
                    <span>
                        ยอดบริจาคปัจจุบัน: <span className="donate-detail-details-bold">{projectData.current_amount.toLocaleString()}</span> บาท
                    </span>
                    <span>
                        เป้าหมาย: <span className="donate-detail-details-bold">{projectData.target_amount.toLocaleString()}</span> บาท
                    </span>
                </div>

                {/* แสดงจำนวนวันที่เหลือ */}
                <div className="donate-detail-discription-day">
                    <span>เหลืออีก {countDay} วัน</span>
                </div>

                <div className="donate-detail-discription">
                    <p>{projectData.description}</p>
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
                    <p className="donate-detail-informations">{projectData.intendant}</p>
                </div>
            </div>

            {/* ฟอร์มบริจาค */}
            <div className="donate-detail-content-item">
                <form onSubmit={handleSubmit}>
                    <div className="donate-detail-form-items">
                        <label htmlFor="amount">ระบุจำนวนเงิน</label>
                        <br />
                        <input
                            type="text"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="กรอกจำนวนเงิน"
                        />
                    </div>

                    {/* QR Code สำหรับ PromptPay */}
                    {formData.amount && (
                        <div className="donate-detail-form-items">
                            <label>QR Code สำหรับการชำระเงิน</label>
                            <button type="button" onClick={generateQRCode}>Generate</button>
                        </div>
                    )}

                    <div className="donate-detail-form-items">
                        <label>ช่องทางการชำระเงิน</label>
                        <p>QR PromptPay</p>
                        {qrCode && <img src={qrCode} alt="QR Code สำหรับการชำระเงิน" style={{ width: "500px", objectFit: "contain" }} />}
                    </div>

                    <div className="donate-detail-form-items">
                        <label htmlFor="file-slip">หลักฐานการชำระเงิน</label>
                        <input type="file" className="file-slip" id="file-slip" onChange={handleFileChange} />
                    </div>

                    <div className="donate-detail-form-items">
                        <label>ใบกำกับภาษี</label>
                        <div>
                            <input
                                type="radio"
                                id="no-tax"
                                name="tax-option"
                                value="no"
                                onChange={handleTaxOptionChange}
                            />
                            <label htmlFor="no-tax">ไม่ต้องการ</label>
                        </div>
                        <div>
                            <input
                                type="radio"
                                id="want-tax"
                                name="tax-option"
                                value="yes"
                                onChange={handleTaxOptionChange}
                            />
                            <label htmlFor="want-tax">ต้องการ</label>
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
                    <button type="submit" className="donate-detail-button">บริจาค</button>
                </form>
            </div>
        </div>


    );
}

export default DonateDetail;
