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
                setProducts(response.data);
            })
    }, []);

    return (
        <>
            <div className="souvenir-top">
                <div className="souvenir-bt">
                    <Link to={`/souvenir_request`}>
                        <button className="souvenir-bt-add"><IoIosAddCircleOutline />เพิ่มของที่ระลึก</button>
                    </Link>
                </div>
            </div>
            <h2 className="titlesouvenir">ของที่ระลึก</h2>
            <div className="souvenir-content">
                <div className="souvenir-content-item">
                </div>
                {/* สินค้าของวิทยาลัยการคอมพิวเตอร์ */}
                <div className="souvenir-content-item">
                    <h3 className="titlesouvenir-type">สินค้าของสมาคมศิษย์เก่า</h3>
                    <div className="souvenir-item-group">
                        {products && products.length > 0 ? (
                            products
                                .filter((product) => product.role_id === 1 || product.role_id === 2)
                                .map((product) => (
                                    <Link to={`/souvenir/souvenirDetail/${product.product_id}`} key={product.product_id}>
                                        <div className="souvenir-item">
                                            <img
                                                className="souvenir-item-img"
                                                src={`http://localhost:3001/uploads/${product.image}`}
                                                alt={product.product_name}
                                            />
                                            <p>{product.product_name}</p>
                                            <p className="souvenir-item-price">฿{product.price}</p>
                                        </div>
                                    </Link>
                                ))
                        ) : (
                            <p>ขออภัย ไม่มีสินค้าในขณะนี้</p>
                        )}
                    </div>
                </div>

                {/* สินค้าของสมาคมศิษย์เก่า */}
                <div className="souvenir-content-item">
                    <h3 className="titlesouvenir-type">สินค้าของศิษย์ปัจจุบัน</h3>
                    <div className="souvenir-item-group">
                        {products && products.length > 0 ? (
                            products
                                .filter((product) => product.role_id === 4 )
                                .map((product) => (
                                    <Link to={`/souvenir/souvenirDetail/${product.product_id}`} key={product.product_id}>
                                        <div className="souvenir-item">
                                            <img
                                                className="souvenir-item-img"
                                                src={`http://localhost:3001/uploads/${product.image}`}
                                                alt={product.product_name}
                                            />
                                            <p>{product.product_name}</p>
                                            <p className="souvenir-item-price">฿{product.price}</p>
                                        </div>
                                    </Link>
                                ))
                        ) : (
                            <p>ขออภัย ไม่มีสินค้าในขณะนี้</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Souvenir;
