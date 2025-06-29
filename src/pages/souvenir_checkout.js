import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import QRCode from "qrcode";
import "bootstrap/dist/css/bootstrap.min.css";
import '../css/SouvenirCheckout.css';

function SouvenirCheckout() {
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [checkoutCart, setCheckoutCart] = useState([]);
    const [currentStep, setCurrentStep] = useState(1); // 1: Order Info, 2: Payment, 3: Upload Slip
    const [qrCodeImage, setQrCodeImage] = useState("");
    const [qrCodeExpiry, setQrCodeExpiry] = useState(null);
    const [paymentSlip, setPaymentSlip] = useState(null);
    const [slipPreview, setSlipPreview] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    const userId = localStorage.getItem("userId");
    const location = useLocation();
    const navigate = useNavigate();

    const selectedItems = location.state?.selectedItems || JSON.parse(localStorage.getItem('selectedItems')) || [];

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:3001/souvenir/cart?user_id=${userId}`, {
                withCredentials: true
            })
                .then(response => {
                    setCheckoutCart(Array.isArray(response.data) ? response.data : []);
                })
                .catch(error => {
                    console.error("Error fetching cart:", error);
                    setCheckoutCart([]);
                });
        }
    }, [userId]);

    // Timer for QR Code expiry
    useEffect(() => {
        let timer;
        if (qrCodeExpiry) {
            timer = setInterval(() => {
                const now = new Date().getTime();
                const timeLeft = qrCodeExpiry - now;

                if (timeLeft <= 0) {
                    setQrCodeImage("");
                    setQrCodeExpiry(null);
                    alert("QR Code หมดอายุแล้ว กรุณาสร้างใหม่");
                }
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [qrCodeExpiry]);

    const getCheckoutTotalPrice = () => {
        return selectedItems.reduce((total, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            if (!isNaN(price) && !isNaN(quantity)) {
                return total + price * quantity;
            }
            return total;
        }, 0);
    };

    // Generate PromptPay QR Code
    const generatePromptPayQR = (amount, promptpayNumber) => {
        if (!promptpayNumber) return "";

        const cleanedNumber = promptpayNumber.replace(/\D/g, "");
        const formattedAmount = amount.toFixed(2);

        // PromptPay format
        const merchantAccountInfo = `0016A000000677010111${cleanedNumber.length.toString().padStart(2, '0')}${cleanedNumber}`;
        const transactionAmount = `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`;

        let payload = `00020101021129${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}5204000053037645${transactionAmount}5802TH6304`;

        // Calculate CRC16
        const crc = calculateCRC16(payload);
        payload += crc;

        return payload;
    };

    // CRC16 calculation for PromptPay
    const calculateCRC16 = (data) => {
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i);
            for (let j = 0; j < 8; j++) {
                if (crc & 1) {
                    crc = (crc >> 1) ^ 0x8408;
                } else {
                    crc >>= 1;
                }
            }
        }
        crc ^= 0xFFFF;
        return crc.toString(16).toUpperCase().padStart(4, '0');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const handleProceedToPayment = async () => {
        if (selectedItems.length === 0) {
            alert("กรุณาเลือกสินค้าก่อนชำระเงิน");
            return;
        }

        if (!deliveryAddress.trim()) {
            alert("กรุณากรอกที่อยู่จัดส่ง");
            return;
        }

        setIsGeneratingQR(true);

        try {
            const totalAmount = getCheckoutTotalPrice();

            // สมาคมกลางใช้เบอร์นี้
            const associationPromptPay = "0924833929";

            const qrData = generatePromptPayQR(totalAmount, associationPromptPay);
            const qrImageUrl = await QRCode.toDataURL(qrData, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });

            setQrCodeImage(qrImageUrl);

            const expiryTime = new Date().getTime() + (15 * 60 * 1000);
            setQrCodeExpiry(expiryTime);

            setOrderDetails({
                promptpayNumber: associationPromptPay,
                amount: totalAmount,
                generatedAt: new Date()
            });

            setCurrentStep(2);
        } catch (error) {
            console.error("Error generating QR code:", error);
            alert("เกิดข้อผิดพลาดในการสร้าง QR Code");
        } finally {
            setIsGeneratingQR(false);
        }
    };


    const handleRegenerateQR = async () => {
        if (orderDetails) {
            setIsGeneratingQR(true);
            try {
                const qrData = generatePromptPayQR(orderDetails.amount, orderDetails.promptpayNumber);
                const qrImageUrl = await QRCode.toDataURL(qrData, {
                    width: 256,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });

                setQrCodeImage(qrImageUrl);
                const expiryTime = new Date().getTime() + (15 * 60 * 1000);
                setQrCodeExpiry(expiryTime);
            } catch (error) {
                console.error("Error regenerating QR code:", error);
                alert("เกิดข้อผิดพลาดในการสร้าง QR Code ใหม่");
            } finally {
                setIsGeneratingQR(false);
            }
        }
    };

    const getTimeLeft = () => {
        if (!qrCodeExpiry) return 0;
        const now = new Date().getTime();
        const timeLeft = Math.max(0, qrCodeExpiry - now);
        return Math.floor(timeLeft / 1000);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleSlipUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
                return;
            }

            setPaymentSlip(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setSlipPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveSlip = () => {
        setPaymentSlip(null);
        setSlipPreview("");
        // Clear file input
        const fileInput = document.getElementById('slip-upload');
        if (fileInput) {
            fileInput.value = "";
        }
    };

    const generateOrderId = () => {
        return `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    };

    const handleFinalCheckout = async () => {
        if (!paymentSlip) {
            alert("กรุณาแนบสลิปการโอนเงิน");
            return;
        }

        setIsProcessing(true);

        try {
            const selectedProducts = checkoutCart
                .filter(item => selectedItems.some(selectedItem => selectedItem.product_id === item.product_id))
                .map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    price: Number(item.price),
                    quantity: item.quantity,
                    image: item.image,
                    total: item.price * item.quantity
                }));

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('order_id', generateOrderId());
            formData.append('products', JSON.stringify(selectedProducts));
            formData.append('total_amount', getCheckoutTotalPrice().toString());
            formData.append('shippingAddress', deliveryAddress);
            formData.append('paymentSlip', paymentSlip);
            formData.append('promptpay_number', orderDetails?.promptpayNumber || '');

            const response = await axios.post("http://localhost:3001/souvenir/checkout", formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Clear selected items from localStorage after successful checkout
            localStorage.removeItem('selectedItems');

            alert("การชำระเงินสำเร็จ! รอการตรวจสอบจากระบบ");
            navigate("/souvenir/souvenir_history");

        } catch (error) {
            console.error("Error during checkout:", error);
            if (error.response) {
                alert("เกิดข้อผิดพลาดในการชำระเงิน: " + (error.response.data.error || "ไม่ทราบข้อผิดพลาด"));
            } else {
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="d-flex justify-content-center mb-4">
            <div className="d-flex align-items-center">
                <div className={`d-flex flex-column align-items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-light'} ${currentStep > 1 ? 'bg-success' : ''}`}
                        style={{ width: '40px', height: '40px' }}>
                        {currentStep > 1 ? '✓' : '1'}
                    </div>
                    <small className="mt-1">ข้อมูลคำสั่งซื้อ</small>
                </div>
                <div className="mx-3" style={{ width: '50px', height: '2px', backgroundColor: currentStep > 1 ? '#28a745' : '#dee2e6' }}></div>
                <div className={`d-flex flex-column align-items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-light'} ${currentStep > 2 ? 'bg-success' : ''}`}
                        style={{ width: '40px', height: '40px' }}>
                        {currentStep > 2 ? '✓' : '2'}
                    </div>
                    <small className="mt-1">ชำระเงิน</small>
                </div>
                <div className="mx-3" style={{ width: '50px', height: '2px', backgroundColor: currentStep > 2 ? '#28a745' : '#dee2e6' }}></div>
                <div className={`d-flex flex-column align-items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted'}`}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ width: '40px', height: '40px' }}>
                        3
                    </div>
                    <small className="mt-1">แนบสลิป</small>
                </div>
            </div>
        </div>
    );

    const renderOrderInfo = () => (
        <div className="row">
            <div className="col-md-8">
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="fas fa-shopping-cart me-2"></i>
                            สินค้าในตะกร้า
                        </h5>
                    </div>
                    <div className="card-body">
                        {selectedItems.length > 0 ? (
                            selectedItems.map((item, index) => (
                                <div className="card mb-3" key={item.product_id}>
                                    <div className="row g-0">
                                        <div className="col-md-3">
                                            <img
                                                src={`http://localhost:3001/uploads/${item.image}`}
                                                alt={item.product_name}
                                                className="img-fluid rounded-start h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="col-md-9">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6 className="card-title">{item.product_name}</h6>
                                                        <p className="card-text">
                                                            <span className="text-primary fw-bold">฿{item.price.toLocaleString()}</span>
                                                        </p>
                                                        <p className="card-text">
                                                            <small className="text-muted">จำนวน: {item.quantity}</small>
                                                        </p>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="badge bg-light text-dark">#{index + 1}</span>
                                                        <div className="mt-2">
                                                            <span className="fw-bold text-success">
                                                                ฿{(item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted py-4">
                                <i className="fas fa-shopping-cart fa-3x mb-3"></i>
                                <p>ไม่มีสินค้าในตะกร้า</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card">
                    <div className="card-header">
                        <h5 className="mb-0">
                            <i className="fas fa-shipping-fast me-2"></i>
                            ข้อมูลการจัดส่ง
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="mb-3">
                            <label htmlFor="deliveryAddress" className="form-label">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                ที่อยู่จัดส่ง *
                            </label>
                            <textarea
                                id="deliveryAddress"
                                className="form-control"
                                rows="4"
                                placeholder="เช่น: 123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                            />
                            <small className="text-muted">กรุณากรอกที่อยู่ให้ครบถ้วนและถูกต้อง</small>
                        </div>

                        <div className="card bg-light">
                            <div className="card-body text-center">
                                <h6 className="card-title">
                                    <i className="fas fa-calculator me-2"></i>
                                    ยอดรวมทั้งหมด
                                </h6>
                                <h3 className="text-primary mb-0">฿{getCheckoutTotalPrice().toLocaleString()}</h3>
                                <small className="text-muted">
                                    รวม {selectedItems.length} รายการ
                                </small>
                            </div>
                        </div>

                        <div className="d-grid gap-2 mt-3">
                            <button className="btn btn-outline-secondary" onClick={handleCancel}>
                                <i className="fas fa-times me-2"></i>
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleProceedToPayment}
                                disabled={isGeneratingQR}
                            >
                                {isGeneratingQR ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        กำลังสร้าง QR Code...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-credit-card me-2"></i>
                                        ดำเนินการชำระเงิน
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="row justify-content-center">
            <div className="col-md-10">
                <div className="card">
                    <div className="card-header text-center bg-primary text-white">
                        <h4 className="mb-0">
                            <i className="fas fa-qrcode me-2"></i>
                            ชำระเงินผ่าน QR Code
                        </h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h5 className="mb-0">
                                            <i className="fas fa-receipt me-2"></i>
                                            สรุปคำสั่งซื้อ
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {selectedItems.map((item, index) => (
                                            <div key={item.product_id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                <div>
                                                    <span className="fw-bold">{item.product_name}</span>
                                                    <br />
                                                    <small className="text-muted">
                                                        <i className="fas fa-boxes me-1"></i>
                                                        จำนวน: {item.quantity}
                                                    </small>
                                                </div>
                                                <span className="text-primary fw-bold">
                                                    ฿{(item.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">ยอดรวมทั้งหมด:</h5>
                                                <h4 className="mb-0 text-success">
                                                    ฿{getCheckoutTotalPrice().toLocaleString()}
                                                </h4>
                                            </div>
                                        </div>

                                        {orderDetails && (
                                            <div className="mt-3 pt-3 border-top">
                                                <small className="text-muted">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    PromptPay: {orderDetails.promptpayNumber}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header text-center">
                                        <h5 className="mb-0">
                                            <i className="fas fa-mobile-alt me-2"></i>
                                            สแกน QR Code เพื่อชำระเงิน
                                        </h5>
                                    </div>
                                    <div className="card-body text-center">
                                        {qrCodeImage ? (
                                            <div>
                                                <div className="border border-2 rounded p-3 mb-3 bg-white">
                                                    <img
                                                        src={qrCodeImage}
                                                        alt="PromptPay QR Code"
                                                        className="img-fluid"
                                                        style={{ maxWidth: '200px' }}
                                                    />
                                                </div>

                                                <div className="alert alert-warning">
                                                    <i className="fas fa-clock me-2"></i>
                                                    <strong>เหลือเวลา: {formatTime(getTimeLeft())}</strong>
                                                    <br />
                                                    <small>QR Code นี้จะหมดอายุใน 15 นาที</small>
                                                </div>

                                                {getTimeLeft() <= 0 && (
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={handleRegenerateQR}
                                                        disabled={isGeneratingQR}
                                                    >
                                                        {isGeneratingQR ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                                กำลังสร้างใหม่...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-sync-alt me-2"></i>
                                                                สร้าง QR Code ใหม่
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border border-2 border-dashed rounded p-4 mb-3">
                                                <div className="mb-3" style={{ fontSize: '4rem' }}>📱</div>
                                                <h6>QR CODE สำหรับชำระเงิน</h6>
                                                <p className="text-primary fw-bold">
                                                    จำนวน: ฿{getCheckoutTotalPrice().toLocaleString()}
                                                </p>
                                                <div className="bg-light p-4 rounded my-3">
                                                    <div style={{ fontSize: '3rem' }}>⬜</div>
                                                    <small className="text-muted">กำลังสร้าง QR Code...</small>
                                                </div>
                                            </div>
                                        )}

                                        <div className="alert alert-info">
                                            <small>
                                                <strong>คำแนะนำ:</strong><br />
                                                1. เปิดแอปธนาคารมือถือ<br />
                                                2. เลือกโอนเงิน สแกน QR<br />
                                                3. สแกน QR Code ด้านบน<br />
                                                4. ตรวจสอบจำนวนเงินและโอน<br />
                                                5. บันทึกสลิปสำหรับขั้นตอนถัดไป
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setCurrentStep(1)}>
                                <i className="fas fa-arrow-left me-2"></i>กลับ
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => setCurrentStep(3)}
                                disabled={!qrCodeImage || getTimeLeft() <= 0}
                            >
                                โอนเงินแล้ว - ไปยังขั้นตอนแนบสลิป
                                <i className="fas fa-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSlipUploadStep = () => (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header text-center">
                        <h4 className="mb-0">แนบสลิปการโอนเงิน</h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-4">
                                    <label className="form-label fw-bold">อัปโหลดสลิปการโอนเงิน</label>
                                    <input
                                        type="file"
                                        id="slip-upload"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleSlipUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <div
                                        className="border border-2 border-dashed rounded p-4 text-center"
                                        style={{ cursor: 'pointer', minHeight: '200px' }}
                                        onClick={() => document.getElementById('slip-upload').click()}
                                    >
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                            <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">คลิกเพื่อเลือกไฟล์สลิป</h5>
                                            <p className="text-muted mb-0">
                                                <small>รองรับไฟล์ภาพ (JPG, PNG)<br />ขนาดไม่เกิน 5MB</small>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {slipPreview && (
                                    <div className="card">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">ตัวอย่างสลิป</h6>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={handleRemoveSlip}
                                            >
                                                <i className="fas fa-trash"></i> ลบ
                                            </button>
                                        </div>
                                        <div className="card-body p-2">
                                            <img
                                                src={slipPreview}
                                                alt="Payment Slip Preview"
                                                className="img-fluid rounded"
                                                style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6">
                                <div className="card bg-light h-100">
                                    <div className="card-header">
                                        <h6 className="mb-0">สรุปการสั่งซื้อ</h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3">
                                            <strong>รายการสินค้า:</strong>
                                            {selectedItems.map((item, index) => (
                                                <div key={item.product_id} className="ms-2 mt-1">
                                                    <small>
                                                        {index + 1}. {item.product_name} x{item.quantity}
                                                        <span className="float-end">฿{(item.price * item.quantity).toLocaleString()}</span>
                                                    </small>
                                                </div>
                                            ))}
                                        </div>

                                        <hr />

                                        <div className="mb-3">
                                            <div className="d-flex justify-content-between">
                                                <strong>ยอดรวมทั้งหมด:</strong>
                                                <strong className="text-success">฿{getCheckoutTotalPrice().toLocaleString()}</strong>
                                            </div>
                                        </div>

                                        <hr />

                                        <div className="mb-3">
                                            <strong>ที่อยู่จัดส่ง:</strong>
                                            <p className="text-muted small mt-1">{deliveryAddress}</p>
                                        </div>

                                        <div className="alert alert-warning">
                                            <small>
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                <strong>หมายเหตุ:</strong> กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                                                และแนบสลิปการโอนเงินก่อนยืนยันการสั่งซื้อ
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <button className="btn btn-outline-secondary" onClick={() => setCurrentStep(2)}>
                                <i className="fas fa-arrow-left me-2"></i>กลับ
                            </button>
                            <button
                                className={`btn btn-success ${(!paymentSlip || isProcessing) ? 'disabled' : ''}`}
                                onClick={handleFinalCheckout}
                                disabled={!paymentSlip || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        กำลังดำเนินการ...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check me-2"></i>ยืนยันการสั่งซื้อ
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12">
                    {/* <h2 className="text-center mb-4">หน้าชำระเงิน</h2> */}

                    {renderStepIndicator()}

                    {currentStep === 1 && renderOrderInfo()}
                    {currentStep === 2 && renderPaymentStep()}
                    {currentStep === 3 && renderSlipUploadStep()}
                </div>
            </div>
        </div>
    );
}

export default SouvenirCheckout;