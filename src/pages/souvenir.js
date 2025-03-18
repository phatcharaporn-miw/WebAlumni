import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { Link } from "react-router-dom";

function Souvenir() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:3001/souvenir")
            .then((response) => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
                setLoading(false);
            });
    }, []);

    if (loading) return <p>กำลังโหลดข้อมูล...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <h2 className="titlesouvenir">ของที่ระลึก</h2>
            <div className="souvenir-content">
                {/* สินค้าของวิทยาลัยการคอมพิวเตอร์ */}
                <div className="souvenir-content-item">
                    <h3 className="titlesouvenir-type">สินค้าของวิทยาลัยการคอมพิวเตอร์</h3>
                    <div className="souvenir-item-group">
                        {products
                            // .filter((product) => product.category === "college")
                            .map((product) => (
                                <Link to={`/souvenir/souvenirDetail/${product.product_id}`}>
                                <div  className="souvenir-item" key={product.id}>
                                    <img
                                        className="souvenir-item-img"
                                        src={`http://localhost:3001/uploads/${product.image}`}
                                        alt={product.product_name}
                                    />
                                    <p>{product.product_name}</p>
                                    <p className="souvenir-item-price">฿{product.price}</p>
                                </div>
                                </Link>
                            ))}
                    </div>
                </div>

                {/* สินค้าของสมาคมศิษย์เก่า */}
                <div className="souvenir-content-item">
                    <h3 className="titlesouvenir-type">สินค้าของสมาคมศิษย์เก่า</h3>
                    <div className="souvenir-item-group">
                        {products
                            // .filter((product) => product.category === "alumni")
                            .map((product) => (
                                <div className="souvenir-item" key={product.id}>
                                    <img
                                        className="souvenir-item-img"
                                        src={`http://localhost:3001/uploads/${product.image}`}
                                        alt={product.product_name}
                                    />
                                    <p>{product.product_name}</p>
                                    <p className="souvenir-item-price">฿{product.price}</p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Souvenir;
