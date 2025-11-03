import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../config";
import { FaChevronLeft, FaCoins, FaUsers } from "react-icons/fa";
import "../css/DonationSummaryDetail.css";

function DonationSummaryDetail() {
    const { type } = useParams();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    const titleMap = {
        project: "ผู้บริจาคตามโครงการ",
        general: "ผู้บริจาคทั่วไป",
        all: "ผู้บริจาคทั้งหมด",
    };

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const res = await axios.get(`${HOSTNAME}/donate/donation-summary-details`, {
                    params: { type }
                });
                const safeData = res.data.map(item => ({
                    donation_id: item.donation_id,
                    project_name: item.project_name || null,
                    full_name: item.full_name || "ผู้บริจาคไม่ประสงค์ออกนาม",
                    profile_image: item.image_path || null,
                    amount: parseFloat(item.amount),
                    payment_status: item.payment_status,
                    donation_date: item.donation_date,
                    note: item.note || "",
                    transaction_id: item.transaction_id || ""
                }));
                setDonations(safeData);
            } catch (err) {
                console.error("โหลดข้อมูลไม่สำเร็จ:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const formatCurrency = (num) => new Intl.NumberFormat("th-TH").format(num || 0);
    const truncateText = (text, maxLength) => text.length <= maxLength ? text : text.substring(0, maxLength) + "...";

    const filteredDonations = donations.filter(d => {
        return true;
    });

    const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
    const recentDonors = filteredDonations.slice(0, 10);

    const displayProjectName = (pName) => pName || "บริจาคทั่วไป";

    return (
        <div className="donation-summary-detail-page">
            <button className="btn-back-modern" onClick={() => navigate(-1)}>
                <FaChevronLeft /> กลับ
            </button>

            <div className="detail-page-header">
                <div className="header-content">
                    <h1>{titleMap[type] || "ผู้บริจาค"}</h1>
                    <p className="header-subtitle">รายชื่อและรายละเอียดการบริจาค</p>
                </div>
            </div>

            <div className="summary-cards-row">
                <div className="summary-card-small">
                    <div className="summary-card-icon users"><FaUsers /></div>
                    <div className="summary-card-info ">
                        <h3 className="text-start">{filteredDonations.length}</h3>
                        <p>รายการผู้บริจาค</p>
                    </div>
                </div>
                <div className="summary-card-small">
                    <div className="summary-card-icon amount"><FaCoins /></div>
                    <div className="summary-card-info">
                        <h3>฿{formatCurrency(totalAmount)}</h3>
                        <p>ยอดรวม</p>
                    </div>
                </div>
            </div>

            <div className="recent-donors-section">
                <div className="recent-donors-header">
                    <FaUsers />
                    <h4>รายชื่อผู้บริจาคล่าสุด</h4>
                    <button
                        className="btn btn-sm btn-primary"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => navigate('/donate/donation-all')}
                    >
                        ดูทั้งหมด
                    </button>
                </div>
                {recentDonors.length > 0 ? (
                    <div className="recent-donors-list">
                        {recentDonors.map((donor) => (
                            <div key={donor.donation_id} className="donor-item">
                                <div className="donor-avatar bg-gray-400 text-white overflow-hidden">
                                    {donor.profile_image ? (
                                        <img
                                            src={`${HOSTNAME}/${donor.profile_image}`}
                                            alt={donor.full_name || "ผู้บริจาค"}
                                            onError={(e) => (e.target.src = `${HOSTNAME}/uploads/default-profile.png`)}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        donor.full_name ? donor.full_name.charAt(0).toUpperCase() : "?"
                                    )}
                                </div>

                                <div className="donor-info">
                                    <div className="donor-name">{donor.full_name}</div>
                                    <div className="donor-details">
                                        <span className="donor-amount">฿{formatCurrency(donor.amount)}</span>
                                        <span className="donor-separator">•</span>
                                        <span className="donor-time">
                                            {new Date(donor.donation_date).toLocaleString("th-TH", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                    <div className="donor-project">
                                        โครงการ: {displayProjectName(donor.project_name)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-donors-message">ยังไม่มีผู้บริจาค</p>
                )}
            </div>
        </div>
    );
}

export default DonationSummaryDetail;