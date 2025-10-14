import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import {useAuth} from '../context/AuthContext';
import {HOSTNAME} from '../config.js';


function Souvenir() {
    const [products, setProducts] = useState([]);
    const {user} = useAuth();
    // const userId = sessionStorage.getItem("userId");

    useEffect(() => {
        window.scrollTo(0, 0);
        axios
            .get(HOSTNAME +"/souvenir", {
                withCredentials: true
            })
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
            });
    }, []);

    return (
    <>
        <div className="text-center mb-5">
            <div className="d-inline-block position-relative">
                <h3 id="head-text" className="text-center mb-3 position-relative">
                    ของที่ระลึก
                    <div
                        className="title-underline position-absolute start-50 translate-middle-x mt-2"
                        style={{
                            width: "120px",
                            height: "4px",
                            background: "linear-gradient(90deg, #007bff, #6610f2)",
                            borderRadius: "2px",
                            boxShadow: "0 2px 8px rgba(0,123,255,0.3)",
                        }}
                    ></div>
                </h3>

                {/* Decorative elements */}
                <div className="position-absolute top-0 start-0 translate-middle">
                    <div className="bg-primary opacity-25 rounded-circle" style={{ width: "20px", height: "20px" }}></div>
                </div>
                <div className="position-absolute top-0 end-0 translate-middle">
                    <div className="bg-success opacity-25 rounded-circle" style={{ width: "15px", height: "15px" }}></div>
                </div>
            </div>
        </div>

        {/* ปุ่มเพิ่มของที่ระลึก */}
        <div className="souvenir-top d-flex justify-content-end mb-3 px-4">
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

        <div className="souvenir-content container">
            {/* สินค้าของสมาคมศิษย์เก่า */}
            <div className="souvenir-content-item mb-5">
                <h3 className="titlesouvenir-type">สินค้าของสมาคมศิษย์เก่า</h3>
                <div className="souvenir-item-group-home row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
                    {products && products.length > 0 ? (
                        products
                            .filter((product) => product.is_official === 1)
                            .map((product) => (
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
                                                    <p className="souvenir-item-price text-success">฿{product.price}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ))
                    ) : (
                        <div className="text-center my-5 text-muted">
                            <p className="fs-5">ขออภัย ไม่มีสินค้าในขณะนี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/*สินค้าของสมาชิกทั่วไป */}
            <div className="souvenir-content-item mb-5">
                <h3 className="titlesouvenir-type">สินค้าของสมาชิกทั่วไป</h3>
                <div className="souvenir-item-group-home row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3">
                    {products && products.length > 0 ? (
                        products
                            .filter((product) => product.is_official === 0)
                            .map((product) => (
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
                                                    <p className="souvenir-item-price text-success">฿{product.price}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ))
                    ) : (
                        <div className="text-center my-5 text-muted">
                            <p className="fs-5">ขออภัย ไม่มีสินค้าในขณะนี้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </>
);

}

export default Souvenir;
