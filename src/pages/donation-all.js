import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../config";
import { FaUsers, FaChevronLeft, FaChevronRight} from "react-icons/fa";
import "../css/DonationSummaryDetail.css";

function DonationAll() {
    const { type } = useParams();
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

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
                    amount: parseFloat(item.amount) || 0,
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
    }, [type]);

    const formatCurrency = (num) => new Intl.NumberFormat("th-TH").format(num || 0);

    // รวมยอดบริจาคของคนเดียวกัน (ตามชื่อ)
    const donorTotals = donations.reduce((acc, curr) => {
        const key = curr.full_name.trim();
        if (!acc[key]) {
            acc[key] = {
                full_name: key,
                total_amount: 0,
                profile_image: curr.profile_image,
                last_donation_date: curr.donation_date,
                project_name: curr.project_name,
            };
        }
        acc[key].total_amount += curr.amount;
        if (new Date(curr.donation_date) > new Date(acc[key].last_donation_date)) {
            acc[key].last_donation_date = curr.donation_date;
        }
        return acc;
    }, {});

    // แปลงเป็น Array และเรียงลำดับจากมากไปน้อย
    const donorList = Object.values(donorTotals).sort((a, b) => b.total_amount - a.total_amount);

    //บริจาคมากสุด
    const topDonor = donorList.length > 0 ? donorList[0] : null;


    // ยอดบริจาครวมทั้งหมด
    const totalAmount = donorList.reduce((sum, d) => sum + d.total_amount, 0);
    
    const filteredDonations = donations.filter(d => {
        return true;
    });

    const recentDonors = filteredDonations.slice(0, 10);

    const displayProjectName = (pName) => pName || "บริจาคทั่วไป";

     // Pagination
    const itemsPerPage = 10;
    const indexOfLastProject = currentPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    const currentProjects = filteredDonations.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="donation-summary-detail-page">
            <div className="detail-page-header">
                <div className="header-content">
                    <h1>รายชื่อผู้บริจาค</h1>
                    <p className="header-subtitle">
                        ยอดบริจาครวมทั้งหมด: ฿{formatCurrency(totalAmount)}
                    </p>
                </div>
            </div>

            {/* ผู้บริจาคมากที่สุด */}
            {topDonor && (
                <div className="top-donor-card shadow-sm rounded-4 p-4 mb-4 text-center bg-gradient-to-r from-yellow-200 to-yellow-50">
                    <div className="top-donor-avatar mb-3 mx-auto" style={{ width: "100px", height: "100px" }}>
                        <img
                            src={
                                topDonor.profile_image
                                    ? `${HOSTNAME}/${topDonor.profile_image}`
                                    : `${HOSTNAME}/uploads/default-profile.png`
                            }
                            alt={topDonor.full_name}
                            className="w-100 h-100 rounded-circle object-cover border border-warning border-3"
                        />
                    </div>
                    <h3 className="fw-bold text-dark">{topDonor.full_name}</h3>
                    <p className="text-muted mb-1">ยอดบริจาคสูงสุดทั้งหมด</p>
                    <h4 className="donor-amount fs-3">
                        ฿{formatCurrency(topDonor.total_amount)}
                    </h4>
                    <p className="text-secondary small mt-2">
                        โครงการล่าสุด: {topDonor.project_name || "บริจาคทั่วไป"}
                    </p>
                </div>
            )}

            {/*รายชื่อผู้บริจาคทั้งหมด */}
            <div className="recent-donors-section">
                <div className="recent-donors-header">
                    <FaUsers />
                    <h4>รายชื่อผู้บริจาคทั้งหมด</h4>
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

            <div className="donate-page-info text-center mt-2">
                                    <small>
                                        หน้า {currentPage} จาก {totalPages} (แสดง {indexOfFirstProject + 1}–
                                        {Math.min(indexOfLastProject, filteredDonations.length)} จาก{" "}
                                        {filteredDonations.length} รายการ)
                                    </small>
                                </div>
            
                                {/*Pagination */}
                                {totalPages > 1 && (
                                    <nav aria-label="Page navigation" className="donate-pagination">
                                        <ul className="pagination justify-content-center mt-4">
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    <FaChevronLeft />
                                                </button>
                                            </li>
            
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                                <li
                                                    key={number}
                                                    className={`page-item ${number === currentPage ? "active" : ""}`}
                                                >
                                                    <button className="page-link" onClick={() => handlePageChange(number)}>
                                                        {number}
                                                    </button>
                                                </li>
                                            ))}
            
                                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    <FaChevronRight />
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
        </div>
    );
}

export default DonationAll;
