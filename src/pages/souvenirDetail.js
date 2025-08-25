import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useCart } from '../context/CartContext'; 

function SouvenirDetail() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [otherProducts, setOtherProducts] = useState([]);
    const user_id = localStorage.getItem('userId');
    const [loadingAddToCart, setLoadingAddToCart] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();
    const {addToCart} = useCart();

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:3001/souvenir/souvenirDetail/${productId}`,{
            withCredentials: true
        })
            .then(response => {
                setProduct(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า");
                setLoading(false);
            });

        // ดึงข้อมูลสินค้าอื่นๆ
        axios.get('http://localhost:3001/souvenir',{
            withCredentials: true
        })
            .then(response => {
                setOtherProducts(response.data);
            })
            .catch(error => {
                console.error('Error fetching other products:', error);
            });
    }, [productId]);

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        if (/^\d+$/.test(value)) {
            let newValue = Number(value);
            if (newValue < 1) newValue = 1;
            if (newValue > product.stock) newValue = product.stock;
            setQuantity(newValue);
        }
    };

    const getRandomProducts = (products, num = 4) => {
        const filteredProducts = products.filter(product => product.product_id !== parseInt(productId));
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };

    const handleBuyNow = () => {
        if (!user_id) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนสั่งซื้อสินค้า",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => {
                navigate("/login");
            });
            return;
        }

        const selectedItem = [
            {
                product_id: product.product_id,
                quantity: quantity,
                product_name: product.product_name,
                price: product.price,
                image: product.image,
                promptpay_number: product.promptpay_number
            }
        ];

        localStorage.setItem('selectedItemsซื้อเลย', JSON.stringify(selectedItem));
        navigate("/souvenir/checkout", { state: { selectedItems: selectedItem } });
    };

    const handleAddToCart = async (productId, quantity) => {
        if (!user_id) {
            Swal.fire({
                title: "กรุณาเข้าสู่ระบบ",
                text: "คุณต้องเข้าสู่ระบบก่อนเพิ่มสินค้า",
                icon: "warning",
                confirmButtonText: "เข้าสู่ระบบ"
            }).then(() => {
                navigate("/login");
            });
            return;
        }

        if (product) {
            const total = product.price * quantity;
            setLoadingAddToCart(true);
            
            try {
                // ใช้ addToCart จาก Context แทน axios โดยตรง
                const response = await addToCart(productId, quantity, total);
                
                setLoadingAddToCart(false);
                
                // อัปเดต selectedItems
                const updatedItems = [...selectedItems, { product_id: productId, quantity: quantity }];
                setSelectedItems(updatedItems);
                localStorage.setItem('selectedItemsเพิ่มตะกร้า', JSON.stringify(updatedItems));
                
                // อัปเดตสต็อกสินค้า
                setProduct(prevProduct => ({
                    ...prevProduct,
                    stock: prevProduct.stock - quantity
                }));
                
                // รีเซ็ตจำนวนสินค้าที่เลือก
                const newStock = product.stock - quantity;
                if (newStock < quantity) {
                    setQuantity(Math.max(1, newStock));
                }
                
                // แสดงข้อความสำเร็จ
                Swal.fire({
                    title: "เพิ่มลงตะกร้าสำเร็จ",
                    text: `เพิ่ม ${product.product_name} จำนวน ${quantity} ชิ้น ลงตะกร้าแล้ว`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                
            } catch (error) {
                console.error("Error adding item to cart:", error);
                setLoadingAddToCart(false);
                
                Swal.fire({
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้ กรุณาลองใหม่อีกครั้ง",
                    icon: "error",
                    confirmButtonText: "ตกลง"
                });
            }
        }
    };

    const randomProducts = getRandomProducts(otherProducts);

    return (
        <>
            <h2 className="titlesouvenirDetail">รายละเอียดสินค้า</h2>
            <div className="souvenirDetail-content">
                <div className="souvenirDetail-content-item">
                    {product && (
                        <div className="souvenirDetail-item" key={product.id}>
                            <div className="souvenirDetail-item-img-container">
                                <img
                                    className="souvenirDetail-item-img"
                                    src={`http://localhost:3001/uploads/${product.image}`}
                                    alt={product.product_name}
                                />
                            </div>
                            <div className="souvenirDetail-item-info">
                                <h3 className="souvenir-item-name">{product.product_name}</h3>
                                <p className="souvenir-item-price">฿{product.price}</p>
                                <div className="product-quantity">
                                    <p>
                                        จำนวน:
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={handleQuantityChange}
                                            min='1'
                                            max={product.stock}
                                        />
                                    </p>
                                    <p className="product-Instock">
                                        สินค้าคงเหลือ {product.stock} ชิ้น
                                    </p>
                                </div>
                                <div className="souvenir-buy_product_button">
                                    <button
                                        className="souvenir-buy_product_basket"
                                        onClick={() => handleAddToCart(product.product_id, quantity)}
                                        disabled={loadingAddToCart || product.stock === 0}
                                    >
                                        {loadingAddToCart ? "กำลังโหลด..." : 
                                        product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
                                    </button>
                                    <button 
                                        className="souvenir-buy_product" 
                                        onClick={handleBuyNow}
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 ? "สินค้าหมด" : "สั่งซื้อสินค้า"}
                                    </button>
                                </div>

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
                        {randomProducts.map((product) => (
                            <Link to={`/souvenir/souvenirDetail/${product.product_id}`} key={product.product_id}>
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