import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { HOSTNAME } from "../config.js";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

function DashboardAlumniPage() {
  const [alumniData, setAlumniData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredAlumni, setHoveredAlumni] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterMajor, setFilterMajor] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const alumniPerPage = 8;

  const navigate = useNavigate();

  // Scroll to top on mount
      useEffect(() => {
          window.scrollTo(0, 0);
      }, []);

  useEffect(() => {
    axios
      .get(`${HOSTNAME}/api/alumni-all`)
      .then((res) => {
        setAlumniData(Array.isArray(res.data.data) ? res.data.data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);



  // ดึงค่าที่ไม่ซ้ำจาก alumniData
  const uniqueMajors = useMemo(() => {
    const majorsSet = new Set();
    alumniData.forEach(a => {
      a.educations?.forEach(edu => {
        if (edu.major_name) majorsSet.add(edu.major_name);
      });
    });
    return Array.from(majorsSet).sort(); // เรียงลำดับ
  }, [alumniData]);

  // สร้าง uniqueYears เป็นช่วงปี 3 ปีขึ้นไป
 const uniqueYearRanges = useMemo(() => {
  const yearsSet = new Set();
  alumniData.forEach((alumni) => {
    alumni.educations?.forEach((edu) => {
      if (edu.graduation_year) {
        yearsSet.add(edu.graduation_year + 543); // บวก 543 (BE)
      }
    });
  });
  const yearsArr = Array.from(yearsSet).sort((a, b) => a - b);
  const ranges = [];

  for (let i = 0; i < yearsArr.length; i += 3) {
    const start = yearsArr[i];
    const end = yearsArr[Math.min(i + 2, yearsArr.length - 1)];
    if (start === end) {
      ranges.push({ value: `${start}-${end}`, label: `${start}` });
    } else {
      ranges.push({ value: `${start}-${end}`, label: `${start}-${end}` });
    }
  }
  return ranges;
}, [alumniData]);


  // filtered alumni
  const filteredAlumni = useMemo(() => {
    return alumniData.filter((a) => {
      const matchesSearch =
        a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // ตอน filter ไม่ต้องบวก 543 อีก
const matchesYear =
  filterYear === "all"
    ? true
    : a.educations?.some((edu) => {
        const eduYear = edu.graduation_year + 543; // บวก 543 ครั้งเดียว
        const [start, end] = filterYear.split("-").map(Number);
        return eduYear >= start && eduYear <= end;
      });

      const matchesMajor =
        filterMajor === "all"
          ? true
          : a.educations?.some((edu) => edu.major_name === filterMajor);

      return matchesSearch && matchesYear && matchesMajor;
    });
  }, [alumniData, searchTerm, filterYear, filterMajor]);


  // pagination logic
  const totalPages = Math.ceil(filteredAlumni.length / alumniPerPage);
  const indexOfLast = currentPage * alumniPerPage;
  const indexOfFirst = indexOfLast - alumniPerPage;
  const currentAlumni = filteredAlumni.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterYear("all");
    setFilterMajor("all");
    setCurrentPage(1);
  };

  const handleAlumniClick = (userId) => {
    navigate(`/alumni/${userId}`);
  };

  return (
    <div className="container mt-5">
      <div className="webboard-page">
        <div className="text-center mb-5">
          <div className="d-inline-block position-relative">
            <h3 id="head-text" className="text-center mb-3 position-relative">
              รายชื่อศิษย์เก่าทั้งหมด
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
      </div>

      {/* Filters */}
      <div className="donate-filters mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="search" className="form-label">
              ค้นหาศิษย์เก่า:
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                id="search"
                className="form-control"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="col-md-3">
            <label htmlFor="major-filter" className="form-label">
              สาขา:
            </label>
            <select
              id="major-filter"
              className="form-select"
              value={filterMajor}
              onChange={(e) => {
                setFilterMajor(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">ทั้งหมด</option>
              {uniqueMajors.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

          </div>

          <div className="col-md-3">
            <label htmlFor="year-filter" className="form-label">
              ปีที่จบการศึกษา:
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="form-select"
            >
              <option value="all">ทั้งหมด</option>
              {uniqueYearRanges.map((range, idx) => (
                <option key={idx} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>


          <div className="col-md-2 d-flex flex-column">
            <label className="form-label invisible">ล้าง</label>
            <button
              className="btn btn-outline-secondary"
              onClick={handleClearFilters}
            >
              <AiOutlineClose /> ล้าง
            </button>
          </div>
        </div>
      </div>

      {/* Alumni list */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : currentAlumni.length > 0 ? (
        <div className="row g-4">
          {currentAlumni.map((alumni, index) => (
            <div
              className="col-md-6"
              key={alumni.user_id}
              onClick={() => handleAlumniClick(alumni.user_id)}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredAlumni(index)}
              onMouseLeave={() => setHoveredAlumni(null)}
            >
              <div
                style={{
                  transition: "all 0.3s ease",
                  borderRadius: "15px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  background:
                    hoveredAlumni === index
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                  boxShadow:
                    hoveredAlumni === index
                      ? "0 15px 40px rgba(0,0,0,0.2)"
                      : "0 5px 20px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={
                    alumni.image_path
                      ? HOSTNAME + `/${alumni.image_path}`
                      : HOSTNAME + `/uploads/default-profile.png`
                  }
                  alt={alumni.name}
                  className="img-fluid rounded-circle me-3"
                  style={{
                    width: "90px",
                    height: "90px",
                    objectFit: "cover",
                    border:
                      hoveredAlumni === index
                        ? "3px solid #FFD700"
                        : "3px solid #0F75BC",
                    transition: "all 0.3s ease",
                    transform: hoveredAlumni === index ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <div className="flex-grow-1">
                  <h5
                    className="mb-2 fw-bold"
                    style={{
                      color: hoveredAlumni === index ? "#fff" : "#333",
                      textShadow: hoveredAlumni === index
                        ? "0 2px 4px rgba(0,0,0,0.3)"
                        : "none",
                    }}
                  >
                    {alumni.full_name || "ไม่ระบุชื่อ"}
                  </h5>

                  {/* การศึกษา */}
                  <p
                    className="mb-1"
                    style={{
                      color: hoveredAlumni === index ? "#f8f9fa" : "#6c757d",
                      fontSize: "0.9rem",
                    }}
                  >
                    {alumni.educations && alumni.educations.length > 0
                      ? alumni.educations.map((edu, i) => (
                        <span key={i}>
                          {edu.degree_name || "ไม่มีระดับ"} | {edu.major_name || "ไม่มีสาขา"} | ปี {edu.graduation_year || "-"}
                          {i < alumni.educations.length - 1 ? <br /> : null}
                        </span>
                      ))
                      : "ไม่มีข้อมูลการศึกษา"}


                  </p>


                  {/* อีเมล */}
                  <p
                    className="mb-1"
                    style={{
                      color: hoveredAlumni === index ? "#f8f9fa" : "#6c757d",
                      fontSize: "0.85rem",
                    }}
                  >
                    <strong>Email:</strong> {alumni.email || "-"}
                  </p>

                  {/* เบอร์โทร */}
                  <p
                    className="mb-0"
                    style={{
                      color: hoveredAlumni === index ? "#f8f9fa" : "#6c757d",
                      fontSize: "0.85rem",
                    }}
                  >
                    <strong>โทร:</strong> {alumni.phone || "-"}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          ไม่พบข้อมูลศิษย์เก่า
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="donate-pagination">
          <ul className="pagination">
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

export default DashboardAlumniPage;
