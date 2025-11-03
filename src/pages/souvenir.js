import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useAuth } from "../context/AuthContext";
import { HOSTNAME } from "../config";

function Souvenir() {
  const [products, setProducts] = useState([]);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [officialFilter, setOfficialFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 8;

  useEffect(() => {
    window.scrollTo(0, 0);
    axios
      .get(HOSTNAME + "/souvenir", { withCredentials: true })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error));
  }, []);

  const handleClearFilters = () => {
    setSearchTerm("");
    setPriceRange("all");
    setOfficialFilter("all");
    setCurrentPage(1);
  };

  // -------------------------------
  // ฟิลเตอร์สินค้า (ค้นหา + ราคา + ประเภท)
  // -------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = p.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const descMatch = p.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (searchTerm && !nameMatch && !descMatch) return false;

      const price = parseFloat(p.price) || 0;

      // ฟิลเตอร์ช่วงราคา
      if (priceRange === "low" && price >= 100) return false;
      if (priceRange === "medium" && (price < 100 || price > 500)) return false;
      if (priceRange === "high" && price <= 500) return false;

      // ฟิลเตอร์ประเภทสินค้า
      if (officialFilter === "official" && p.is_official !== 1) return false;
      if (officialFilter === "member" && p.is_official !== 0) return false;

      return true;
    });
  }, [products, searchTerm, priceRange, officialFilter]);

  // -------------------------------
  // Pagination
  // -------------------------------
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* หัวข้อ */}
      <div className="webboard-page">
        <div className="text-center mb-5">
          <div className="d-inline-block position-relative">
            <h3 id="head-text" className="text-center mb-3 position-relative">
              ของที่ระลึก
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

      {/* ฟิลเตอร์ */}
      <div className="donate-filters mb-4 container">
        <div className="row g-3">
          {/* ค้นหา */}
          <div className="col-md-4">
            <label htmlFor="search" className="form-label">
              ค้นหาสินค้า:
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="ชื่อสินค้า หรือ รายละเอียด"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* ประเภทสินค้า */}
          <div className="col-md-3">
            <label htmlFor="type" className="form-label">
              ประเภทสินค้า:
            </label>
            <select
              id="type"
              className="form-select"
              value={officialFilter}
              onChange={(e) => {
                setOfficialFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">สินค้าทั้งหมด</option>
              <option value="official">สินค้าสมาคมศิษย์เก่า</option>
              <option value="member">สินค้าสมาชิกทั่วไป</option>
            </select>
          </div>

          {/* ช่วงราคา */}
          <div className="col-lg-3 col-md-2">
            <label htmlFor="price" className="form-label">
              ช่วงราคา:
            </label>
            <select
              id="price"
              className="form-select"
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">ทั้งหมด</option>
              <option value="low">ต่ำกว่า 100 บาท</option>
              <option value="medium">100 - 500 บาท</option>
              <option value="high">มากกว่า 500 บาท</option>
            </select>
          </div>

          {/* ปุ่มล้าง */}
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

      {/* ปุ่มเพิ่มของที่ระลึก */}
      <div className="container">
        <div className="souvenir-top d-flex justify-content-end mb-3">
          {user && (
            <Link to={`/souvenir/souvenir_request`} className="text-decoration-none">
              <button
                className="btn btn-gradient d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm"
                style={{
                  background: "linear-gradient(45deg, #0d6efd, #4dabf7)",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(45deg, #0a58ca, #339af0)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(13, 110, 253, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(45deg, #0d6efd, #4dabf7)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
              >
                <IoIosAddCircleOutline size={24} />
                เพิ่มของที่ระลึก
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* แสดงสินค้า */}
      <div className="souvenir-content container">
        <div className="souvenir-content-item mb-5">
          <h3 className="titlesouvenir-type">
            {officialFilter === "all"
              ? "สินค้าทั้งหมด"
              : officialFilter === "official"
                ? "สินค้าสมาคมศิษย์เก่า"
                : "สินค้าสมาชิกทั่วไป"}
          </h3>
          <div className="souvenir-item-group-home row row-cols-1 row-cols-sm-2 row-cols-lg-4 row-cols-md-2 g-3">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <div className="col" key={product.product_id}>
                  {product.is_sold_out ? (
                    <div className="souvenir-item card h-100 shadow-sm border-0 position-relative">
                      <img
                        className="souvenir-item-img card-img-top"
                        src={HOSTNAME + `/uploads/${product.image}`}
                        alt={product.product_name}
                        style={{ filter: "grayscale(90%)", opacity: 0.6 }}
                      />
                      <div className="card-body text-center">
                        <p className="card-title fw-semibold">{product.product_name}</p>
                        <p className="souvenir-item-price text-muted">฿{product.price}</p>
                        <span className="badge bg-danger mt-2">สินค้าหมดแล้ว</span>
                        <small className="text-muted">รอผู้ดูแลเพิ่มสินค้า</small>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/souvenir/souvenirDetail/${product.product_id}`}
                      className="text-decoration-none text-dark"
                    >
                      <div className="souvenir-item card h-100 shadow-sm border-0 position-relative">
                        <img
                          className="souvenir-item-img card-img-top"
                          src={HOSTNAME + `/uploads/${product.image}`}
                          alt={product.product_name}
                        />
                        <div className="card-body text-center">
                          <p className="card-title fw-semibold">{product.product_name}</p>
                          <p className="souvenir-item-price text-success">
                            ฿{product.price}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "50vh", width: "100%" }}
              >
                <p className="text-muted ">
                  ขออภัย ไม่มีสินค้าตรงตามเงื่อนไขที่เลือก
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* แสดงข้อมูลหน้าปัจจุบัน */}
      <div className="donate-page-info text-center mt-3">
        <small className="text-muted">
          หน้า {currentPage} จาก {totalPages}{" "}
          (แสดง {indexOfFirstProduct + 1}-
          {Math.min(indexOfLastProduct, filteredProducts.length)} จาก{" "}
          {filteredProducts.length} รายการ)
        </small>
      </div>

      {/* ระบบแบ่งหน้า */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="donate-pagination mt-3">
          <ul className="pagination justify-content-center">
            {/* ปุ่มย้อนกลับ */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
            </li>

            {/* หมายเลขหน้า */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <li
                key={number}
                className={`page-item ${number === currentPage ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              </li>
            ))}

            {/* ปุ่มไปหน้าถัดไป */}
            <li
              className={`page-item ${currentPage === totalPages ? "disabled" : ""
                }`}
            >
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

export default Souvenir;
