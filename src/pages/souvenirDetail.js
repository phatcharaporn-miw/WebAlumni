import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

function SouvenirDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // สถานะจำนวนสินค้าเริ่มต้นที่ 1
    const [otherProducts, setOtherProducts] = useState([]);

    useEffect(() => {
        // ดึงข้อมูลสินค้าที่กำลังดูอยู่
        setLoading(true);
        axios.get(`http://localhost:3001/souvenir/souvenirDetail/${productId}`)
            .then(response => {
                setProduct(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
                setLoading(false);
            });

        // ดึงข้อมูลสินค้าอื่นๆ ที่ไม่ใช่สินค้ารายละเอียด
        axios.get('http://localhost:3001/souvenir')
            .then(response => {
                setOtherProducts(response.data); // สมมติว่า response.data เป็นข้อมูลสินค้าที่จะนำมาแสดง
            })
            .catch(error => {
                console.error('Error fetching other products:', error);
            });
    }, [productId]);

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    if (loading) return <p className="loading-message">กำลังโหลดข้อมูล...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <>
            <h2 className="titlesouvenirDetail">รายละเอียดสินค้า</h2>
            <div className="souvenirDetail-content">
                <div className="souvenirDetail-content-item">
                    {product && (
                        <div className="souvenirDetail-item" key={product.id}>
                            {/* รูปภาพของสินค้า */}
                            <div className="souvenirDetail-item-img-container">
                                <img
                                    className="souvenirDetail-item-img"
                                    src={`http://localhost:3001/uploads/${product.image}`}
                                    alt={product.product_name}
                                />
                            </div>
                            {/* ข้อมูลรายละเอียดสินค้า */}
                            <div className="souvenirDetail-item-info">
                                <h3 className="souvenir-item-name">{product.product_name}</h3>
                                <p className="souvenir-item-price">฿{product.price}</p>
                                {/* เพิ่มฟอร์มสำหรับเลือกจำนวน */}
                                <div className="product-quantity">
                                    <p>
                                        จำนวน:
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            min="1"
                                            max={product.stock}
                                        />
                                    </p>
                                    <p className="product-Instock">
                                        สินค้าคงเหลือ {product.stock} ชิ้น
                                    </p>
                                </div>
                                <Link><button className="souvenir-buy_product">สั่งซื้อสินค้า</button></Link>
                                <div className="description-product">
                                    <p className="souvenir-item-title-description">รายละเอียด</p>
                                    <p className="souvenir-item-description">{product.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <hr />

                <div className="souvenirDetail-content-item">
                    <p className="souvenirDetail-other-products-title">สินค้าอื่นๆ</p>
                    <div className="souvenirDetail-other-products">
                        {otherProducts.map((product) => (
                            <Link to={`/souvenir/souvenirDetail/${product.product_id}`} key={product.id}>
                                <div className="souvenir-other-product">
                                    <img
                                        className="souvenir-other-product-img"
                                        src={`http://localhost:3001/uploads/${product.image}`}
                                        alt={product.product_name}
                                    />
                                    <p>{product.product_name}</p>
                                    <p className="souvenir-other-item-price">฿{product.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default SouvenirDetail;
