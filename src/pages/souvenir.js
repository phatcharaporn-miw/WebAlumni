import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";

function Souvenir() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        axios
            .get("http://localhost:3001/souvenir")
            .then((response) => {
                console.log(response.data);
                setProducts(response.data);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
            });
    }, []);

    return (
    <>
        <div className="souvenir-top d-flex justify-content-end mb-3 px-4">
            <Link to={`/souvenir/souvenir_request`}>
                <button className="souvenir-bt-add btn btn-primary d-flex align-items-center gap-2">
                    <IoIosAddCircleOutline size={20} />
                    เพิ่มของที่ระลึก
                </button>
            </Link>
        </div>

        <div className="text-center mb-4">
            <h2 className="titlesouvenir">ของที่ระลึก</h2>
        </div>

        <div className="souvenir-content container">
            {/* สินค้าของสมาคมศิษย์เก่า */}
            <div className="souvenir-content-item mb-5">
                <h3 className="titlesouvenir-type ">
                    สินค้าของสมาคมศิษย์เก่า
                </h3>
                <div className="souvenir-item-group row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                    {products && products.length > 0 ? (
                        products
                            .filter((product) => [1, 2, 3].includes(product.role_id))
                            .map((product) => (
                                <div className="col" key={product.product_id}>
                                    <Link to={`/souvenir/souvenirDetail/${product.product_id}`} className="text-decoration-none text-dark">
                                        <div className="souvenir-item card h-100 shadow-sm border-0">
                                            <img
                                                className="souvenir-item-img card-img-top"
                                                src={`http://localhost:3001/uploads/${product.image}`}
                                                alt={product.product_name}
                                            />
                                            <div className="card-body text-center">
                                                <p className="card-title fw-semibold">{product.product_name}</p>
                                                <p className="souvenir-item-price text-success">฿{product.price}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                    ) : (
                        <div className="text-center my-5 text-muted">
                            <p className="fs-5">ขออภัย ไม่มีสินค้าในขณะนี้</p>
                        </div>
                    )}
                </div>
            </div>

            {/* สินค้าของศิษย์ปัจจุบัน */}
            <div className="souvenir-content-item mb-5">
                <h3 className="titlesouvenir-type">
                    สินค้าของศิษย์ปัจจุบัน
                </h3>
                <div className="souvenir-item-group row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
                    {products && products.length > 0 ? (
                        products
                            .filter((product) => product.role_id === 4)
                            .map((product) => (
                                <div className="col" key={product.product_id}>
                                    <Link to={`/souvenir/souvenirDetail/${product.product_id}`} className="text-decoration-none text-dark">
                                        <div className="souvenir-item card h-100 shadow-sm border-0">
                                            <img
                                                className="souvenir-item-img card-img-top"
                                                src={`http://localhost:3001/uploads/${product.image}`}
                                                alt={product.product_name}
                                            />
                                            <div className="card-body text-center">
                                                <p className="card-title fw-semibold">{product.product_name}</p>
                                                <p className="souvenir-item-price text-success">฿{product.price}</p>
                                            </div>
                                        </div>
                                    </Link>
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
