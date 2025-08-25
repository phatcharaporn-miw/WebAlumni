import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { MdDateRange } from "react-icons/md";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/search.css';

function SearchResult() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (query) {
            axios
                .get(`http://localhost:3001/search/search-all?search=${query}`)
                .then((res) => {
                    // console.log("Search results:", res.data.data);
                    setResults(res.data.data || []);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching search results:", err);
                    setLoading(false);
                });
        }
    }, [query]);

    if (loading) {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                            <div className="text-center">
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <h5 className="text-muted">กำลังค้นหา...</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <div className="row">
                <div className="col-lg-12 mx-auto">
                    {/* Header Section */}
                    <div className="search-header mb-4 p-4 bg-light rounded-3 shadow-sm">
                        <h1 className="h2 mb-2 fw-bold">
                            ผลการค้นหา: <span className="fw-bold text-primary">"{query}"</span>
                        </h1>
                        <p className="text-muted">
                            {results.length > 0 && (
                                <small className="ms-2 text-secondary">
                                    ค้นหาพบ: {results.length} รายการ
                                </small>
                            )}
                        </p>
                    </div>

                    {/* Results Section */}
                    {results.length === 0 ? (
                        <div className="no-results text-center py-5">
                            <div className="mb-4">
                                <i className="fas fa-search-minus display-1 text-muted"></i>
                            </div>
                            <h4 className="text-muted mb-3">ไม่พบข้อมูลที่ค้นหา</h4>
                            <p className="text-muted">ลองค้นหาด้วยคำอื่น หรือตรวจสอบการสะกดอีกครั้ง</p>
                        </div>
                    ) : (
                        <div className="results-container">
                            {results.map((item, idx) => (
                                <div key={idx} className="result-item mb-3">
                                    <Link to={getLink(item)} className="text-decoration-none">
                                        <div className="card border-0 shadow-sm result-card h-100">
                                            <div className="card-body p-4">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="card-title text-dark mb-2 fw-bold">
                                                        {item.title}
                                                    </h5>
                                                    <span className={`badge ${getTypeBadgeClass(item.type)} ms-2`}>
                                                        {getTypeLabel(item.type)}
                                                    </span>
                                                </div>

                                                <p className="card-text text-muted mb-3" style={{ lineHeight: '1.6' }}>
                                                    {item.content?.slice(0, 150)}
                                                    {item.content?.length > 150 && '...'}
                                                </p>

                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">
                                                        <MdDateRange className="me-1" />
                                                        {new Date(item.created_at).toLocaleDateString("th-TH")}
                                                    </small>
                                                    <small className="text-muted ">
                                                        อ่านเพิ่มเติม
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getLink(item) {
    //  console.log("Selected item:", item);
    switch (item.type) {
        case "news":
            return `/news/${item.id}`;
        case "webboard":
            return `/webboard/${item.id}`;
        case "activity":
            return `/activity/${item.id}`;
        case "donationproject":
            return `/donate/donatedetail/${item.id}`;
        case "products":
            return `/souvenir/souvenirDetail/${item.id}`;
        case "profiles":
        case "educations":
            return `/alumni/${item.user_id}`;
        default:
            return "/";
    }
}

// ฟังก์ชันกำหนดสีและสไตล์ badge ตามประเภท
function getTypeBadgeClass(type) {
    switch (type) {
        case "news":
            return "bg-primary bg-opacity-10 text-primary";
        case "webboard":
            return "bg-success bg-opacity-10 text-success"; 
        case "activity":
            return "bg-warning bg-opacity-10 text-warning";
        case "donationproject":
            return "bg-danger bg-opacity-10 text-danger";
        case "products":
            return "bg-info bg-opacity-10 text-info";
        default:
            return "bg-secondary bg-opacity-10 text-secondary";
    }
}

// ฟังก์ชันแปลงชื่อประเภทเป็นภาษาไทย
function getTypeLabel(type) {
    switch (type) {
        case "news":
            return "ข่าวสาร";
        case "webboard":
            return "เว็บบอร์ด";
        case "activity":
            return "กิจกรรม";
        case "donationproject":
            return "บริจาค";
        case "products":
            return "สินค้า";
        default:
            return "อื่นๆ";
    }
}

export default SearchResult;