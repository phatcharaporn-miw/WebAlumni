import { useEffect, useState, useMemo } from "react";
import "../../css/DonationSummaryDetail.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { FaSearch, FaChevronLeft, FaChevronRight, FaCoins, FaUsers, FaFileCsv } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import { HOSTNAME } from '../../config.js';

function DashboardDonationsPage() {
    const [projects, setProjects] = useState([]);
    const [filter, setFilter] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRange, setSelectedRange] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const { type } = useParams();
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();
    const projectsPerPage = 10;

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
                setProjects(safeData);
            } catch (err) {
                console.error("โหลดข้อมูลไม่สำเร็จ:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    //  Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            // ฟิลเตอร์ช่วงเดือนจาก donation_date 
            if (selectedRange !== "all") {
                const date = new Date(project.donation_date);
                const month = date.getMonth() + 1;
                const [start, end] = selectedRange.split("-").map(Number);
                if (month < start || month > end) return false;
            }

            // ค้นหาจากชื่อโครงการหรือชื่อผู้บริจาค
            if (searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase();

                // ถ้าไม่มีproject_nameถือว่าเป็น บริจาคทั่วไป
                const projectName = project.project_name
                    ? project.project_name.toLowerCase()
                    : "บริจาคทั่วไป";

                const donorName = project.full_name?.toLowerCase() || "";

                // ค้นหาชื่อผู้บริจาค และชื่อโครงการ
                if (!projectName.includes(searchLower) && !donorName.includes(searchLower)) {
                    return false;
                }
            }

            return true;
        });
    }, [projects, searchTerm, selectedRange]);


    const totalAmount = filteredProjects.reduce((sum, d) => sum + d.amount, 0);
    const recentDonors = filteredProjects.slice(0, 10);

    const displayProjectName = (pName) => pName || "บริจาคทั่วไป";

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("th-TH", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedRange("all");
        setCurrentPage(1);
    };

    // Export filteredProjects to CSV
    const exportToCSV = () => {
        if (!filteredProjects || filteredProjects.length === 0) {
            console.error("ไม่มีข้อมูลที่จะส่งออกเป็น CSV");
            return;
        }

        // BOM (\ufeff) ช่วยให้โปรแกรม CSV reader อ่านภาษาไทยได้ถูกต้อง
        const BOM = '\ufeff';

        const headers = ['donation_id', 'project_name', 'full_name', 'amount', 'payment_status', 'donation_date', 'note', 'transaction_id'];
        const rows = filteredProjects.map(p => ([
            p.donation_id,
            p.project_name || '',
            p.full_name || '',
            p.amount ?? '',
            p.payment_status || '',
            p.donation_date || '',
            p.note || '',
            p.transaction_id || ''
        ]));

        const csv = [headers, ...rows]
            .map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        // นำ BOM มาต่อหน้า string CSV ก่อนสร้าง Blob
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        a.download = `donations_${now}.csv`;

        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };


    // ฟังก์ชันช่วยเช็กว่าเดือนอยู่ในช่วงที่เลือกหรือไม่
    const isInSelectedMonthRange = (date, range) => {
        if (!date || range === "all") return true;
        const month = new Date(date).getMonth() + 1; // getMonth() = 0-11
        const [start, end] = range.split("-").map(Number);
        return month >= start && month <= end;
    };

    // Pagination
    const itemsPerPage = 10;
    const indexOfLastProject = currentPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="donate-page p-5">
            <div className="text-center mb-5">
                <div className="d-inline-block position-relative">
                    <h3 id="head-text" className="text-center mb-3 position-relative">
                        ยอดบริจาครวมทั้งหมด
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
            <div className="donate-content-wrapper">
                {/* Filters */}
                <div className="donate-filters">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label htmlFor="search" className="form-label">ค้นหาโครงการ:</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    id="search"
                                    className="form-control"
                                    placeholder="ค้นหาชื่อผู้บริจาคหรือชื่อโครงการ..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>

                        <div className="col-md-3">
                            <label htmlFor="month-range" className="form-label">ช่วงเดือน:</label>
                            <select
                                id="month-range"
                                className="form-select"
                                value={selectedRange}
                                onChange={(e) => setSelectedRange(e.target.value)}
                            >
                                <option value="all">ทุกเดือน</option>
                                <option value="1-4">มกราคม - เมษายน</option>
                                <option value="5-8">พฤษภาคม - สิงหาคม</option>
                                <option value="9-12">กันยายน - ธันวาคม</option>
                            </select>
                        </div>

                        <div className="col-md-3 d-flex flex-column">
                            <label className="form-label invisible">ล้าง</label>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={handleClearFilters}
                                title="ล้างตัวกรอง"
                            >
                                <AiOutlineClose />ล้าง
                            </button>
                        </div>
                        <div className="col-md-2 d-flex flex-column">
                            <label className="form-label invisible">export</label>
                            <button
                                className="btn btn-outline-success"
                                onClick={exportToCSV}
                                title="ส่งออก CSV"
                            >
                                <FaFileCsv /> Export Flie
                            </button>
                        </div>
                    </div>
                </div>

                <div className="donation-summary-detail-page">
                    <div className="summary-cards-row">
                        <div className="summary-card-small">
                            <div className="summary-card-icon users"><FaUsers /></div>
                            <div className="summary-card-info">
                                <h3>{filteredProjects.length} รายการ</h3>
                                <p>รายการผู้บริจาค</p>
                            </div>
                        </div>
                        <div className="summary-card-small">
                            <div className="summary-card-icon amount"><FaCoins /></div>
                            <div className="summary-card-info">
                                <h3>฿{formatCurrency(totalAmount)}</h3>
                                <p>ยอดบริจาครวมทั้งหมด</p>
                            </div>
                        </div>
                    </div>

                    {/*รายชื่อผู้บริจาค */}
                    <div className="recent-donors-section">
                        <div className="recent-donors-header">
                            <h4>รายชื่อผู้บริจาค</h4>
                        </div>
                        {currentProjects.length > 0 ? (
                            <div className="recent-donors-list">
                                {currentProjects.map((donor) => (
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
                                                donor.full_name
                                                    ? donor.full_name.charAt(0).toUpperCase()
                                                    : "?"
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
                                                        minute: "2-digit",
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
                            <p className="no-donors-message text-center mt-3">ยังไม่มีผู้บริจาค</p>
                        )}
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

                    <div className="donate-page-info text-center mt-2">
                        <small>
                            หน้า {currentPage} จาก {totalPages} (แสดง {indexOfFirstProject + 1}–
                            {Math.min(indexOfLastProject, filteredProjects.length)} จาก{" "}
                            {filteredProjects.length} รายการ)
                        </small>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default DashboardDonationsPage;