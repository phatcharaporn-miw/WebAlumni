import React, { useEffect, useState } from "react";
import "../css/Souvenir.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";

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


    useEffect(() => {
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

        // ดึงข้อมูลสินค้าอื่นๆ
        axios.get('http://localhost:3001/souvenir')
            .then(response => {
                setOtherProducts(response.data);
            })
            .catch(error => {
                console.error('Error fetching other products:', error);
            });
    }, [productId]);

    const handleAddToCart = (productId, quantity) => {
        if (product) {
            const total = product.price * quantity;
            setLoadingAddToCart(true);
            axios.post("http://localhost:3001/souvenir/cart/add", {
                product_id: productId,
                quantity: quantity,
                user_id: user_id,
                total: total
            })
                .then(response => {
                    console.log(response.data);
                    setLoadingAddToCart(false);
                })
                .catch(error => {
                    console.error("Error adding item to cart:", error);
                    setLoadingAddToCart(false);
                });
        }
    };

    const handleQuantityChange = (e) => {
        setQuantity(e.target.value);
    };

    const getRandomProducts = (products, num = 4) => {
        const filteredProducts = products.filter(product => product.product_id !== parseInt(productId));
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };


    const handleBuyNow = () => {
        console.log("Navigating to checkout with selected items:", [{ product_id: product.product_id, quantity: quantity }]);
        window.location.href = `/souvenir/checkout?product_id=${product.product_id}&quantity=${quantity}`;
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
                                <button
                                    className="souvenir-buy_product"
                                    onClick={() => handleAddToCart(product.product_id, quantity)} // ส่ง productId และ quantity
                                    disabled={loadingAddToCart}
                                >
                                    {loadingAddToCart ? "กำลังโหลด..." : "เพิ่มลงตะกร้า"}
                                </button>

                                {/* <Link to={`/souvenir/souvenir_checkout`} state={{ selectedItems: [{ product_id: product.product_id, quantity: quantity }] }}>
                                    <button className="souvenir-buy_product">สั่งซื้อสินค้า</button>
                                </Link> */}

                                <button className="souvenir-buy_product" onClick={handleBuyNow}>สั่งซื้อสินค้า</button>


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
