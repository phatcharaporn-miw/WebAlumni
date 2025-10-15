import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { HOSTNAME } from '../config.js';

function SouvenirDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [otherProducts, setOtherProducts] = useState([]);
    const { user } = useAuth();
    const [loadingAddToCart, setLoadingAddToCart] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        setLoading(true);
        axios.get(HOSTNAME + `/souvenir/souvenirDetail/${productId}`, {
            withCredentials: true
        })
            .then(response => {
                setProduct(response.data);
                setLoading(false);
                setQuantity(1);
            })
            .catch(error => {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
                setLoading(false);
            });

        axios.get(HOSTNAME + '/souvenir', {
            withCredentials: true
        })
            .then(response => setOtherProducts(response.data))
            .catch(() => { });
    }, [productId]);

    // ใช้จำนวนคงเหลือจาก slot
    const available = product?.slot?.available ?? 0;

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setQuantity(value);
        }
    };

    const handleQuantityBlur = () => {
        let num = Number(quantity);
        if (!num || num < 1) {
            Swal.fire({
                icon: "warning",
                title: "จำนวนสินค้าต้องไม่น้อยกว่า 1",
                confirmButtonText: "ตกลง"
            });
            setQuantity(1);
        } else if (num > available) {
            Swal.fire({
                icon: "warning",
                title: "จำนวนสินค้าไม่พอ",
                text: `มีสินค้าในสล็อตนี้เพียง ${available} ชิ้น`,
                confirmButtonText: "ตกลง"
            });
            setQuantity(available);
        }
    };

    const handleBuyNow = () => {
        if (!user || !user.user_id) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนสั่งซื้อสินค้า",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => navigate("/login"));
            return;
        }
        if (!product?.slot?.slot_id) return;

        const selectedItem = [{
            product_id: product.product_id,
            slot_id: product.slot.slot_id,
            slot_name: product.slot.slot_name,
            quantity: quantity,
            product_name: product.product_name,
            price: product.price,
            image: product.image,
            promptpay_number: product.promptpay_number
        }];
        sessionStorage.setItem('selectedItemsซื้อเลย', JSON.stringify(selectedItem));
        navigate("/souvenir/checkout", { state: { selectedItems: selectedItem } });
    };

    const handleAddToCart = async () => {
        if (!user || !user.user_id) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนเพิ่มสินค้า",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => navigate("/login"));
            return;
        }
        if (!product?.slot?.slot_id || quantity < 1 || quantity > available) return;

        setLoadingAddToCart(true);
        try {
            await addToCart(product.product_id, quantity, product.price * quantity, product.slot.slot_id);
            setProduct(prev => ({
                ...prev,
                slot: {
                    ...prev.slot,
                    available: prev.slot.available - quantity
                }
            }));
            setQuantity(1);

            Swal.fire({
                title: "เพิ่มลงตะกร้าสำเร็จ",
                text: `เพิ่ม ${product.product_name} (${product.slot.slot_name}) จำนวน ${quantity} ชิ้น ลงตะกร้าแล้ว`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง",
                icon: "error",
                confirmButtonText: "ตกลง"
            });
        } finally {
            setLoadingAddToCart(false);
        }
    };

    const getRandomProducts = (products, num = 4) => {
        const filteredProducts = products.filter(product => product.product_id !== parseInt(productId));
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };
    const randomProducts = getRandomProducts(otherProducts);

    return (
        <>
            <h2 className="titlesouvenirDetail">รายละเอียดสินค้า</h2>
            <div className="souvenirDetail-content">
                <div className="souvenirDetail-content-item">
                    {product && (
                        <div className="souvenirDetail-item" key={product.product_id}>
                            <div className="souvenirDetail-item-img-container">
                                <img
                                    className="souvenirDetail-item-img"
                                    src={HOSTNAME + `/uploads/${product.image}`}
                                    alt={product.product_name}
                                />
                            </div>
                            <div className="souvenirDetail-item-info">
                                <h3 className="souvenir-item-name">{product.product_name}</h3>
                                <p className="souvenir-item-price">฿{product.price}</p>

                                {product.slot && (
                                    <div className="mb-2">
                                        <span className="fw-semibold">ประเภท/สล็อต: </span>
                                        <span>{product.slot.slot_name}</span>
                                    </div>
                                )}
                                <div className="product-quantity">
                                    <p>
                                        จำนวน:
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            onBlur={handleQuantityBlur}
                                            min="1"
                                            max={available}
                                            disabled={available === 0}
                                        />
                                    </p>
                                    <p className="product-Instock">
                                        คงเหลือ {available} ชิ้น
                                    </p>
                                </div>

                                {user?.user_id === product.user_id ? (
                                    // เจ้าของสินค้า → แสดงช่องทางติดต่อแอดมิน
                                    <div className="contact-admin my-3">
                                        <p className="text-warning fw-semibold">
                                            สำหรับแก้ไข/ลบ/เพิ่มล็อตสินค้า กรุณาติดต่อแอดมิน
                                        </p>
                                        <ul className="list-unstyled">
                                            <li><strong>Email: </strong>admin@example.com</li>
                                            <li><strong>เบอร์: </strong>081-234-5678</li>
                                            <li><strong>Facebook: </strong>AlumniCollegeOfComputing</li>
                                        </ul>
                                    </div>
                                ) : (
                                    // คนทั่วไป 
                                    <div className="souvenir-buy_product_button">
                                        <button
                                            className="souvenir-buy_product_basket"
                                            onClick={handleAddToCart}
                                            disabled={loadingAddToCart || available === 0}
                                        >
                                            {loadingAddToCart ? "กำลังโหลด..." : available === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
                                        </button>
                                        <button
                                            className="souvenir-buy_product"
                                            onClick={handleBuyNow}
                                            disabled={available === 0}
                                        >
                                            {available === 0 ? "สินค้าหมด" : "สั่งซื้อสินค้า"}
                                        </button>
                                    </div>
                                )}

                                <div className="description-product">
                                    <p className="souvenir-item-title-description">รายละเอียด</p>
                                    <p className="souvenir-item-description">{product.description}</p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
                <hr />
                {/* <div className="souvenirDetail-content-item">
                    <p className="souvenirDetail-other-products-title">สินค้าอื่นๆ</p>
                    <div className="souvenirDetail-other-products">
                        {randomProducts.length > 0 ? (
                            randomProducts.map((product) =>
                                product.is_sold_out ? (
                                    <div className="col" key={product.product_id}>
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
                                    </div>
                                ) : (
                                    <div className="col" key={product.product_id}>
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
                                    </div>
                                )
                            )
                        ) : (
                            <p>ไม่มีสินค้าอื่นๆ</p>
                        )}
                    </div>
                </div> */}
                <div className="souvenirDetail-content-item mt-5">
                    <h5 className="souvenirDetail-other-products-title text-center mb-4 fw-bold">
                        สินค้าอื่นๆ
                    </h5>

                    {randomProducts.length > 0 ? (
                        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-4">
                            {randomProducts.map((product) => (
                                <div className="col" key={product.product_id}>
                                    {/* ถ้าสินค้าหมด */}
                                    {product.is_sold_out ? (
                                        <div
                                            className="souvenir-item card h-100 border-0 shadow-sm position-relative hover-shadow transition-all sold-out"
                                            style={{ cursor: "not-allowed" }}
                                        >
                                            <div className="position-relative">
                                                <img
                                                    className="souvenir-item-img card-img-top rounded-top"
                                                    src={HOSTNAME + `/uploads/${product.image}`}
                                                    alt={product.product_name}
                                                    style={{
                                                        objectFit: "cover",
                                                        height: "180px",
                                                        width: "100%",
                                                        filter: "grayscale(90%) opacity(0.6)",
                                                    }}
                                                />
                                            </div>
                                            <div className="card-body text-center">
                                                <p className="card-title fw-semibold mb-1 text-truncate">
                                                    {product.product_name}
                                                </p>
                                                <p className="souvenir-item-price text-muted mb-1">
                                                    ฿{product.price}
                                                </p>
                                                <span className="badge bg-danger mb-2 px-3 py-1">สินค้าหมดแล้ว</span>
                                                <small className="text-muted d-block">
                                                    รอผู้ดูแลเพิ่มสินค้า
                                                </small>
                                            </div>
                                        </div>
                                    ) : (
                                        // ถ้ายังมีสินค้า กดที่การ์ดได้
                                        <Link
                                            to={`/souvenir/souvenirDetail/${product.product_id}`}
                                            className="text-decoration-none text-dark"
                                        >
                                            <div
                                                className="souvenir-item card h-100 border-0 shadow-sm position-relative hover-shadow transition-all"
                                                style={{ cursor: "pointer" }}
                                            >
                                                <div className="position-relative">
                                                    <img
                                                        className="souvenir-item-img card-img-top rounded-top"
                                                        src={HOSTNAME + `/uploads/${product.image}`}
                                                        alt={product.product_name}
                                                        style={{
                                                            objectFit: "cover",
                                                            height: "180px",
                                                            width: "100%",
                                                            transition: "transform 0.3s ease-in-out",
                                                        }}
                                                    />
                                                </div>
                                                <div className="card-body text-center">
                                                    <p className="card-title fw-semibold mb-1 text-truncate">
                                                        {product.product_name}
                                                    </p>
                                                    <p className="souvenir-item-price text-success fw-bold mb-0">
                                                        ฿{product.price}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted mt-4">ไม่มีสินค้าอื่นๆ ในตอนนี้</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default SouvenirDetail;