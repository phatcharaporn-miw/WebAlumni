import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import '../css/SouvenirCheckout.css';
import Swal from 'sweetalert2';
import jsQR from "jsqr";

function SouvenirCheckout() {
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [checkoutCart, setCheckoutCart] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [qrCodeImage, setQrCodeImage] = useState("");
    const [qrCodeExpiry, setQrCodeExpiry] = useState(null);
    const [paymentSlip, setPaymentSlip] = useState(null);
    const [slipPreview, setSlipPreview] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [qrCode, setQrCode] = useState(null);

    const userId = localStorage.getItem("userId");
    const location = useLocation();
    const navigate = useNavigate();

    // ใช้ selectedItems จาก localStorage หรือ state
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

    // ฟังก์ชันคำนวณยอดรวม
    const getCurrentProducts = () => selectedItems || [];
    const getCurrentProductsTotal = () => {
        return getCurrentProducts().reduce((sum, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            if (!isNaN(price) && !isNaN(quantity)) {
                return sum + price * quantity;
            }
            return sum;
        }, 0);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    // ดำเนินการสร้าง QR สำหรับสินค้าทั้งกลุ่ม
    const handleProceedToPayment = async () => {
        const items = getCurrentProducts();
        if (!items.length) {
            Swal.fire({
                icon: 'warning',
                title: 'ไม่มีสินค้าในตะกร้า',
                text: 'กรุณาเพิ่มสินค้าก่อนดำเนินการชำระเงิน',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        if (!deliveryAddress.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณากรอกที่อยู่จัดส่ง',
                text: 'ที่อยู่จัดส่งไม่สามารถว่างเปล่าได้',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        if (!items[0].promptpay_number) {
            Swal.fire({
                icon: 'warning',
                title: 'ไม่พบหมายเลข PromptPay',
                text: 'กรุณาเลือกสินค้าที่มีหมายเลข PromptPay ก่อนดำเนินการชำระเงิน',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        setIsGeneratingQR(true);

        try {
            const totalAmount = getCurrentProductsTotal();

            // เรียก backend เพื่อสร้าง QR Code
            const response = await axios.post('http://localhost:3001/souvenir/generateQR', {
                amount: totalAmount,
                numberPromtpay: items[0].promptpay_number
            });

            const qrImageUrl = response.data?.Result;
            if (!qrImageUrl) {
                alert("เกิดข้อผิดพลาด: ไม่สามารถสร้าง QR Code");
                setIsGeneratingQR(false);
                return;
            }

            setQrCodeImage(qrImageUrl);
            const expiryTime = new Date().getTime() + (15 * 60 * 1000); // 15 นาที
            setQrCodeExpiry(expiryTime);

            setOrderDetails({
                promptpayNumber: items[0].promptpay_number,
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
                const response = await axios.post('http://localhost:3001/souvenir/generateQR', {
                    amount: orderDetails.amount,
                    numberPromtpay: orderDetails.promptpayNumber
                });

                const qrImageUrl = response.data?.Result;
                if (!qrImageUrl) {
                    alert("ไม่สามารถสร้าง QR Code ใหม่");
                    setIsGeneratingQR(false);
                    return;
                }

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

    // จัดการอัปโหลดสลิปการโอนเงิน
    const handleSlipUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire({
                    icon: 'error',
                    title: 'ไฟล์ไม่ถูกต้อง',
                    text: 'กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG)',
                    confirmButtonText: 'ตกลง'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'ไฟล์ใหญ่เกินไป',
                    text: 'ขนาดไฟล์สลิปการโอนเงินต้องไม่เกิน 5MB',
                    confirmButtonText: 'ตกลง'
                });
                return;
            }
            setPaymentSlip(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setSlipPreview(e.target.result);

                // ตรวจสอบ QR Code ในภาพสลิป
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (!code) {
                        Swal.fire({
                            icon: 'error',
                            title: 'สลิปไม่ถูกต้อง',
                            text: 'กรุณาอัปโหลดสลิปที่มี QR Code ชัดเจน',
                            confirmButtonText: 'ตกลง'
                        });
                        setPaymentSlip(null);
                        setSlipPreview("");
                        return;
                    }

                    // ตรวจสอบข้อมูลใน QR
                    // const qrData = code.data;
                    // if (
                    //     !qrData.includes(orderDetails.promptpayNumber) ||
                    //     !qrData.includes(getCurrentProductsTotal().toFixed(2))
                    // ) {
                    //     Swal.fire({
                    //         icon: 'error',
                    //         title: 'ข้อมูลใน QR Code ไม่ตรง',
                    //         text: 'กรุณาอัปโหลดสลิปที่ตรงกับรายการชำระเงิน',
                    //         confirmButtonText: 'ตกลง'
                    //     });
                    //     setPaymentSlip(null);
                    //     setSlipPreview("");
                    //     return;
                    // }
                };
                img.src = e.target.result;
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

    // ชำระเงินและแนบสลิปสำหรับสินค้าทั้งกลุ่ม
    const handleFinalCheckout = async () => {
        if (!paymentSlip) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาแนบสลิปการโอนเงิน',
                text: 'คุณต้องแนบสลิปการโอนเงินก่อนดำเนินการชำระเงิน',
                confirmButtonText: 'ตกลง'
            });
            return;
        }

        setIsProcessing(true);

        try {
            const items = getCurrentProducts();
            if (!items.length) throw new Error("ไม่พบสินค้าในตะกร้า");

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('user_id', userId);
            formData.append('order_id', generateOrderId());
            formData.append('products', JSON.stringify(items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                price: Number(item.price),
                quantity: item.quantity,
                image: item.image,
                total: item.price * item.quantity,
                promptpay_number: item.promptpay_number
            }))));
            formData.append('seller_id', items[0].seller_id || "");
            formData.append('total_amount', getCurrentProductsTotal().toString());
            formData.append('shippingAddress', deliveryAddress);
            formData.append('paymentSlip', paymentSlip);
            formData.append('promptpay_number', items[0].promptpay_number);

            const response = await axios.post("http://localhost:3001/souvenir/checkout", formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await Swal.fire({
                icon: 'success',
                title: 'สั่งซื้อสินค้าสำเร็จ!',
                text: 'สั่งซื้อสินค้าสำเร็จ กรุณารอการตรวจสอบสลิปจากแอดมิน!',
                confirmButtonText: 'ตกลง'
            });

            localStorage.removeItem('selectedItems');

            // ดึงข้อมูลสินค้าใหม่ (optional ถ้าอยู่หน้าเดิม)

            // ไปหน้าประวัติหรือหน้าหลัก
            const userRole = localStorage.getItem("userRole");
            if (userRole === "3") {
                navigate("/alumni-profile/alumni-profile-souvenir");
            } else if (userRole === "4") {
                navigate("/student-profile/student-profile-souvenir");
            } else if (userRole === "2") {
                navigate("/president-profile/president-profile-souvenir");
            } else {
                navigate("/"); // กลับหน้าหลักหรือหน้า error
            }

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

    // ตรวจสอบสลิป
    // const handleFileChange = async (e) => {
    //         const file = e.target.files[0];
    //         if (!file) {
    //             setFormData(prev => ({ ...prev, file: null, slipText: "" }));
    //             setFilePreview(null);
    //             return;
    //         }
    
    //         const fileError = validateFile(file);
    //         if (fileError) {
    //             setErrors(prev => ({ ...prev, file: fileError }));
    //             setFilePreview(null);
    //             return;
    //         }
    
    //         setErrors(prev => ({ ...prev, file: "" }));
    //         setFormData(prev => ({
    //             ...prev,
    //             file: file,
    //             slipText: ""
    //         }));
    
    //         // Create file preview
    //         try {
    //             const reader = new FileReader();
    //             reader.onload = (event) => {
    //                 setFilePreview(event.target.result);
    //             };
    //             reader.onerror = () => {
    //                 setErrors(prev => ({ ...prev, file: "ไม่สามารถอ่านไฟล์ได้" }));
    //             };
    //             reader.readAsDataURL(file);
    
    //             // QR Code detection with better error handling
    //             const qrReader = new FileReader();
    //             qrReader.onload = (event) => {
    //                 try {
    //                     const img = new Image();
    //                     img.onload = () => {
    //                         const canvas = document.getElementById("canvas");
    //                         if (!canvas) return;
    
    //                         const ctx = canvas.getContext("2d");
    //                         canvas.width = img.width;
    //                         canvas.height = img.height;
    //                         ctx.drawImage(img, 0, 0);
    
    //                         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //                         const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    //                         if (code) {
    //                             console.log("QR Code Detected:", code.data);
    //                             // Could implement QR validation logic here
    //                         }
    //                     };
    //                     img.onerror = () => {
    //                         console.warn("Could not process image for QR detection");
    //                     };
    //                     img.src = event.target.result;
    //                 } catch (error) {
    //                     console.warn("QR detection failed:", error);
    //                 }
    //             };
    //             qrReader.readAsDataURL(file);
    //         } catch (error) {
    //             console.error("File processing failed:", error);
    //             setErrors(prev => ({ ...prev, file: "ไม่สามารถประมวลผลไฟล์ได้" }));
    //         }
    //     };

    // ปรับ UI ให้แสดงสินค้าทั้งกลุ่ม
    const renderOrderInfo = () => {
        const items = getCurrentProducts();
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card mb-4">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    สินค้าในตะกร้า
                                </h5>
                            </div>
                            <div className="card-body p-0">
                                {items.length > 0 ? (
                                    <div className="list-group list-group-flush">
                                        {items.map((item, idx) => (
                                            <div className="list-group-item p-3" key={item.product_id}>
                                                <div className="row g-3 align-items-center">
                                                    {/* Product Image */}
                                                    <div className="col-6 col-sm-4 col-md-3">
                                                        <div className="position-relative">
                                                            <img
                                                                src={`http://localhost:3001/uploads/${item.image}`}
                                                                alt={item.product_name}
                                                                className="img-fluid rounded shadow-sm"
                                                                style={{
                                                                    objectFit: 'cover',
                                                                    aspectRatio: '1/1',
                                                                    width: '100%'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="col-6 col-sm-8 col-md-9">
                                                        <div className="d-flex flex-column h-100">
                                                            <div className="flex-grow-1">
                                                                <h6 className="card-title mb-2 text-truncate"
                                                                    title={item.product_name}>
                                                                    {item.product_name}
                                                                </h6>

                                                                {/* Price and Quantity*/}
                                                                <div className="d-block d-sm-none">
                                                                    <div className="mb-2">
                                                                        <span className="text-primary fw-bold fs-6">
                                                                            ฿{item.price.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <small className="text-muted">
                                                                            จำนวน: {item.quantity}
                                                                        </small>
                                                                    </div>
                                                                    <div>
                                                                        {/* <span className="badge bg-primary fs-6">
                                                                            ฿{(item.price * item.quantity).toLocaleString()}
                                                                        </span> */}
                                                                    </div>
                                                                </div>

                                                                {/* Price and Quantity - Desktop Layout */}
                                                                <div className="d-none d-sm-flex justify-content-between align-items-end">
                                                                    <div>
                                                                        <div className="mb-1">
                                                                            <span className="text-primary fw-bold">
                                                                                ฿{item.price.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            จำนวน: {item.quantity}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-5">
                                        <p className="mb-0">ไม่มีสินค้าในตะกร้า</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <i className="fas fa-truck me-2"></i>
                                    ข้อมูลการจัดส่ง
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="mb-4">
                                    <label htmlFor="deliveryAddress" className="form-label">
                                        ที่อยู่จัดส่ง *
                                    </label>
                                    <textarea
                                        id="deliveryAddress"
                                        className="form-control w-100"
                                        required
                                        rows="4"
                                        placeholder="เช่น: 123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        style={{ resize: 'none' }}
                                    />
                                    <small className="text-muted">กรุณากรอกที่อยู่ให้ครบถ้วนและถูกต้อง</small>
                                </div>

                                <div className="card bg-light">
                                    <div className="card-body text-center">
                                        <h6 className="card-title text-muted mb-2">
                                            ยอดรวมทั้งหมด
                                        </h6>
                                        <h3 className="text-primary mb-2 fw-bold"> ฿{getCurrentProductsTotal().toFixed(2)}</h3>
                                        <small className="text-muted">
                                            {items.length} รายการ
                                        </small>
                                    </div>
                                </div>

                                <div className="d-grid gap-2 mt-3">
                                    <button className="btn btn-outline-secondary" onClick={handleCancel}>
                                        ยกเลิก
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={handleProceedToPayment}
                                        disabled={isGeneratingQR || !deliveryAddress.trim()}
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
            </div>
        );
    };

    // ส่วนชำระเงินและแนบสลิปให้ใช้สินค้าทั้งกลุ่ม
    const renderPaymentStep = () => {
        const items = getCurrentProducts();
        return (
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header bg-primary text-white text-center">
                                        <h5 className="mb-0">
                                            สรุปคำสั่งซื้อ
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        {items.length > 0 && items.map(item => (
                                            <div key={item.product_id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                <div>
                                                    <span className="fw-bold fs-5">{item.product_name}</span>
                                                    <br />
                                                    <span className="text-primary fw-semibold">
                                                        ฿{item.price.toLocaleString()}
                                                    </span>
                                                    <br />
                                                    <span className="text-muted">
                                                        จำนวน: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="mt-3 pt-3 border-top">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0 fw-bold">ยอดรวมทั้งหมด:</h5>
                                                <h4 className="mb-0 text-primary fw-semibold">
                                                    ฿{getCurrentProductsTotal().toFixed(2)}
                                                </h4>
                                            </div>
                                        </div>

                                        {orderDetails && (
                                            <div className="mt-3 pt-3 border-top">
                                                <small className="text-muted">
                                                    PromptPay: {orderDetails.promptpayNumber}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header bg-primary text-white text-center">
                                        <h5 className="mb-0">
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
                                                                สร้าง QR Code ใหม่
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border border-2 border-dashed rounded p-4 mb-3">
                                                <h6>QR CODE สำหรับชำระเงิน</h6>
                                                <p className="text-primary fw-bold">
                                                    จำนวน:  ฿{getCurrentProductsTotal().toFixed(2)}
                                                </p>
                                                <div className="bg-light p-4 rounded my-3">
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
                                กลับ
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => setCurrentStep(3)}
                                disabled={!qrCodeImage || getTimeLeft() <= 0}
                            >
                                โอนเงินแล้ว - ไปยังขั้นตอนแนบสลิป
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSlipUploadStep = () => {
        const items = getCurrentProducts();
        return (
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card">
                        <div className="card-header text-center bg-primary text-white">
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
                                                <h6 className="mb-0 fw-bold">ตัวอย่างสลิป</h6>
                                            </div>
                                            <div className="card-body p-2">
                                                <img
                                                    src={slipPreview}
                                                    alt="Payment Slip Preview"
                                                    className="img-fluid rounded"
                                                    style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div className="card-footer bg-transparent border-0 text-end">
                                                <button
                                                    className="btn btn-sm btn-danger px-3 py-1"
                                                    style={{ minWidth: '60px', fontSize: '0.95rem' }}
                                                    onClick={handleRemoveSlip}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <div className="card bg-light h-100">
                                        <div className="card-header">
                                            <h6 className="mb-0 fw-bold">สรุปการสั่งซื้อ</h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <strong>รายการสินค้า:</strong>
                                                {items.length > 0 && items.map(item => (
                                                    <div className="ms-2 mt-1" key={item.product_id}>
                                                        <small>
                                                            {item.product_name} x{item.quantity}
                                                            <span className="float-end">฿{getCurrentProductsTotal().toFixed(2)}</span>
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>

                                            <hr />

                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between">
                                                    <strong>ยอดรวมทั้งหมด:</strong>
                                                    <strong className="text-primary">฿{getCurrentProductsTotal().toFixed(2)}</strong>
                                                </div>
                                            </div>
                                            <hr />

                                            <div className="mb-3">
                                                <strong>ที่อยู่จัดส่ง:</strong>
                                                <p className="text-muted small mt-1">{deliveryAddress}</p>
                                            </div>

                                            <div className="alert alert-warning">
                                                <small>
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
                                    กลับ
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleFinalCheckout}
                                    disabled={!paymentSlip || isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            กำลังดำเนินการ...
                                        </>
                                    ) : (
                                        <>
                                            ยืนยันการสั่งซื้อ
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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


    return (
        <div className="container-fluid py-4">
            <div className="row justify-content-center">
                <div className="col-12">
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