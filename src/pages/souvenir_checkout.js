import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import '../css/SouvenirCheckout.css';
import { ChevronDown, ChevronUp } from "lucide-react";
import { IoAdd } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';
import { HOSTNAME } from '../config.js';
import Swal from 'sweetalert2';
import jsQR from "jsqr";
import { FiCopy, FiCheck } from 'react-icons/fi';

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
    const [copiedField, setCopiedField] = useState(null);

    // const userId = sessionStorage.getItem("userId");
    const { user } = useAuth();
    const userId = user?.user_id;
    const location = useLocation();
    const navigate = useNavigate();

    // State สำหรับเก็บ user_addresses_id ที่เลือก
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    // ใช้ selectedItems จาก localStorage หรือ state
    const selectedItems = location.state?.selectedItems || JSON.parse(localStorage.getItem('selectedItems')) || [];

    // ที่อยู่
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subDistricts, setSubDistricts] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedSubDistrict, setSelectedSubDistrict] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [profilePhone, setProfilePhone] = useState("");
    const [phoneForOrder, setPhoneForOrder] = useState("");


    const sortedProvinces = [...provinces].sort((a, b) =>
        a.name_th.localeCompare(b.name_th, "th")
    );
    const sortedDistricts = [...districts].sort((a, b) =>
        a.name_th.localeCompare(b.name_th, "th")
    );
    const sortedSubDistricts = [...subDistricts].sort((a, b) =>
        a.name_th.localeCompare(b.name_th, "th")
    );

    // State สำหรับเก็บที่อยู่ของผู้ใช้
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [isDefault, setIsDefault] = useState(false);
    const [showAllAddresses, setShowAllAddresses] = useState(false);

    const defaultAddr = userAddresses.find((addr) => addr.is_default === 1);
    const otherAddresses = userAddresses.filter((addr) => addr.is_default !== 1);

    const provinceName = provinces.find(p => p.id === Number(selectedProvince))?.name_th || "";
    const districtName = districts.find(d => d.id === Number(selectedDistrict))?.name_th || "";
    const subDistrictName = subDistricts.find(s => s.id === Number(selectedSubDistrict))?.name_th || "";

    // console.log("Selected Items:", provinceName);

    useEffect(() => {
        if (defaultAddr) {
            setDeliveryAddress(defaultAddr.shippingAddress || "");
            setSelectedProvince(defaultAddr.province_id || "");
            setSelectedDistrict(defaultAddr.district_id || "");
            setSelectedSubDistrict(defaultAddr.sub_district_id || "");
            setZipCode(defaultAddr.zip_code || "");
            setPhoneForOrder(defaultAddr.phone || "");
        }
    }, [defaultAddr]);

    function formatFullAddress(addr) {
        if (!addr) return "";
        return `${addr.shippingAddress || ""} ต.${addr.sub_district_name || ""} อ.${addr.district_name || ""} จ.${addr.province_name || ""} ${addr.zip_code || ""}`;
    }

    useEffect(() => {
        if (user && user.user_id) {
            axios.get(HOSTNAME + `/souvenir/cart?user_id=${user.user_id}`, {
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

    useEffect(() => {
        // โหลดจังหวัด
        axios.get("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json")
            .then(res => setProvinces(res.data))
            .catch(err => console.error("Error loading provinces:", err));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            axios.get("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json")
                .then(res => {
                    const filtered = res.data.filter(dist => dist.province_id === Number(selectedProvince));
                    setDistricts(filtered);
                })
                .catch(err => console.error("Error loading districts:", err));
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            axios.get("https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json")
                .then(res => {
                    const filtered = res.data.filter(sub => sub.district_id === Number(selectedDistrict));
                    setSubDistricts(filtered);
                })
                .catch(err => console.error("Error loading sub-districts:", err));
        }
    }, [selectedDistrict]);

    // เมื่อเลือกตำบลแล้วให้ดึง zip_code ออกมา
    useEffect(() => {
        if (selectedSubDistrict) {
            const sub = subDistricts.find(s => s.id === Number(selectedSubDistrict));
            if (sub) {
                setZipCode(sub.zip_code);
            }
        }
    }, [selectedSubDistrict, subDistricts]);


    useEffect(() => {
        if (userId) {
            fetchAddresses();
            axios.get(HOSTNAME + `/souvenir/user/shippingAddress?user_id=${userId}`)
                .then(res => {
                    setUserAddresses(res.data);

                    const defaultAddr = res.data.find(a => a.is_default === 1);
                    if (defaultAddr) {
                        setSelectedAddress(defaultAddr.shippingAddress);
                        setSelectedAddressId(defaultAddr.user_addresses_id);
                        setSelectedProvince(defaultAddr.province_id || "");
                        setSelectedDistrict(defaultAddr.district_id || "");
                        setSelectedSubDistrict(defaultAddr.sub_district_id || "");
                        setDeliveryAddress(defaultAddr.shippingAddress);
                        setZipCode(defaultAddr.zip_code || "");
                        setPhoneForOrder(defaultAddr.phone || "")
                        setIsDefault(true);
                    }
                    // console.log("User addresses:", res.data);
                })
                .catch(err => console.error(err));
        }
    }, [userId]);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(HOSTNAME + `/souvenir/user/shippingAddress?user_id=${userId}`);
            setUserAddresses(res.data);

            const defaultAddr = res.data.find(a => a.is_default === 1);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr.shippingAddress);
                setSelectedAddressId(defaultAddr.user_addresses_id);
                setSelectedProvince(defaultAddr.province_id || "");
                setSelectedDistrict(defaultAddr.district_id || "");
                setSelectedSubDistrict(defaultAddr.sub_district_id || "");
                setDeliveryAddress(defaultAddr.shippingAddress);
                setZipCode(defaultAddr.zip_code || "");
                setPhoneForOrder(defaultAddr.phone || "")
                setIsDefault(true);
            }
        } catch (err) {
            console.error("Error fetching addresses:", err);
        }
    };

    // กดปุ่มแก้ไข
    const handleEditAddress = (addr) => {
        setIsAddingNewAddress(true);
        setSelectedAddressId(addr.user_addresses_id);
        setDeliveryAddress(addr.shippingAddress || "");
        setSelectedProvince(addr.province_id || "");
        setSelectedDistrict(addr.district_id || "");
        setSelectedSubDistrict(addr.sub_district_id || "");
        setZipCode(addr.zip_code || "");
        setPhoneForOrder(addr.phone || "");
        setIsDefault(addr.is_default === 1);
    };

    // ฟังก์ชันบันทึกที่อยู่หลังแก้ไข
    const handleSaveAddress = async () => {
        window.scrollTo(0, 0);

        if (!deliveryAddress || !selectedProvince || !selectedDistrict || !selectedSubDistrict) {
            Swal.fire({
                icon: "warning",
                title: "กรอกข้อมูลไม่ครบ",
                text: "กรุณากรอกที่อยู่ให้ครบทุกช่อง",
            });
            return;
        }

        try {
            const payload = {
                user_id: userId,
                shippingAddress: deliveryAddress,
                province_id: selectedProvince,
                province_name: provinceName,
                district_id: selectedDistrict,
                district_name: districtName,
                sub_district_id: selectedSubDistrict,
                sub_district_name: subDistrictName,
                zip_code: zipCode,
                phone: phoneForOrder,
                is_default: isDefault ? 1 : 0
            };

            // ถ้ามี selectedAddressId = แก้ไข, ไม่งั้น = เพิ่มใหม่
            if (selectedAddressId) {
                payload.user_addresses_id = selectedAddressId;
                await axios.put(HOSTNAME + "/souvenir/user/shippingAddress", payload);

                setUserAddresses(prev =>
                    prev.map(addr =>
                        addr.user_addresses_id === selectedAddressId
                            ? { ...addr, ...payload }
                            : addr
                    )
                );

                Swal.fire({
                    icon: "success",
                    title: "แก้ไขสำเร็จ",
                    text: "ที่อยู่ถูกอัปเดตเรียบร้อยแล้ว",
                });
            } else {
                // เพิ่มใหม่
                const { data } = await axios.post(HOSTNAME + "/souvenir/user/shippingAddress", payload);

                setUserAddresses(prev => [...prev, data]); // เพิ่มที่อยู่ใหม่เข้า state

                Swal.fire({
                    icon: "success",
                    title: "เพิ่มที่อยู่สำเร็จ",
                    text: "ที่อยู่ถูกบันทึกเรียบร้อยแล้ว",
                });
            }

            await fetchAddresses();
            setIsAddingNewAddress(false);
            setSelectedAddressId(null);

        } catch (err) {
            console.error("Error saving address:", err);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: "ไม่สามารถบันทึกที่อยู่ได้ กรุณาลองใหม่",
            });
        }
    };

    function formatFullAddress(addr) {
        if (!addr) return "";
        return `${addr.shippingAddress || ""} 
        ต.${addr.sub_district_name || ""} 
        อ.${addr.district_name || ""} 
        จ.${addr.province_name || ""} 
        ${addr.zip_code || ""}
        ${addr.phone_number ? 'โทร: ' + addr.phone_number : ''}`.replace(/\s+/g, " ").trim();
    }

    const handleDeleteAddress = async (addressId) => {
        const addrBeing = userAddresses.find(a => a.user_addresses_id === addressId);
        if (addrBeing?.is_default === 1) {
            Swal.fire({
                icon: "warning",
                title: "ไม่สามารถลบได้",
                text: "ที่อยู่เริ่มต้นไม่สามารถลบได้",
            });
            return;
        }

        const result = await Swal.fire({
            title: "คุณแน่ใจหรือไม่?",
            text: "คุณต้องการลบที่อยู่นี้ใช่หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ใช่, ลบเลย",
            cancelButtonText: "ยกเลิก",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(HOSTNAME + `/souvenir/user/shippingAddress/${addressId}`);

            setUserAddresses(prev => prev.filter(a => a.user_addresses_id !== addressId));
            // ถ้า address ที่ลบคือที่เลือกอยู่ ให้เคลียร์และปิดฟอร์ม
            if (selectedAddressId === addressId) {
                setSelectedAddressId(null);
                setDeliveryAddress("");
                setSelectedProvince("");
                setSelectedDistrict("");
                setSelectedSubDistrict("");
                setZipCode("");
                setPhoneForOrder("");
                setIsDefault(false);
                setIsAddingNewAddress(false);
                // setShowAllAddresses(true);
            }
            Swal.fire({
                icon: "success",
                title: "ลบสำเร็จ",
                text: "ที่อยู่ถูกลบเรียบร้อยแล้ว",
            });
            window.scrollTo(0, 0);
        } catch (err) {
            console.error("Error deleting address:", err);

            if (err.response && err.response.status === 400) {
                Swal.fire({
                    icon: "error",
                    title: "ลบไม่ได้",
                    text: "ที่อยู่นี้ถูกใช้งานในคำสั่งซื้อแล้ว ไม่สามารถลบได้",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาด",
                    text: "ไม่สามารถลบที่อยู่ได้ กรุณาลองใหม่",
                });
            }
        }
    };

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

const handleProceedToPayment = async () => {
    const items = getCurrentProducts();
    if (!items.length) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่มีสินค้าในตะกร้า',
            text: 'กรุณาเพิ่มสินค้าก่อนดำเนินการชำระเงิน'
        });
        return;
    }

    if (!deliveryAddress.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกที่อยู่จัดส่ง',
            text: 'ที่อยู่จัดส่งไม่สามารถว่างเปล่าได้'
        });
        return;
    }

    const first = items[0];
    const totalAmount = getCurrentProductsTotal();
    const isOfficial = Number(first?.is_official) === 1;

    // console.log("First item:", first);
    // console.log("is_official:", first?.is_official, "→ isOfficial:", isOfficial);

    let bankInfo = null;

    try {
        // เรียก API เดียว โดยส่ง isOfficial ไปเสมอ
        const response = await axios.get(`${HOSTNAME}/souvenir/bank-info`, {
            params: { 
                isOfficial: isOfficial ? "true" : "false"
            },
        });
        
        // console.log("API Response:", response.data);
        bankInfo = response.data?.data;

    } catch (err) {
        console.error("Error fetching bank info:", err);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถดึงข้อมูลบัญชีธนาคารได้'
        });
        return;
    }

    // ตรวจสอบว่ามีข้อมูลจริง และไม่ใช่ค่า default
    if (!bankInfo || bankInfo.account_name === '-') {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบข้อมูลธนาคาร',
            text: isOfficial 
                ? 'ยังไม่ได้ตั้งค่าบัญชีธนาคารของสมาคม กรุณาติดต่อผู้ดูแลระบบ'
                : 'ผู้ขายยังไม่ได้ตั้งค่าบัญชีธนาคาร กรุณาติดต่อผู้ขาย'
        });
        return;
    }

    // Set orderDetails
    const newOrderDetails = {
        bankInfo: {
            account_name: bankInfo.account_name || '-',
            bank_name: bankInfo.bank_name || '-',
            account_number: bankInfo.account_number || '-',
            promptpay_number: bankInfo.promptpay_number || null,
        },
        amount: totalAmount,
        generatedAt: new Date(),
    };

    setOrderDetails(newOrderDetails);

    // สร้าง QR Code ถ้ามี promptpay_number
    if (bankInfo?.promptpay_number) {
        setIsGeneratingQR(true);
        try {
            const qrRes = await axios.post(`${HOSTNAME}/souvenir/generateQR`, {
                amount: totalAmount,
                numberPromtpay: bankInfo.promptpay_number,
            });

            const qrImageUrl = qrRes.data?.Result;
            if (qrImageUrl) {
                setQrCodeImage(qrImageUrl);
                setQrCodeExpiry(Date.now() + 15 * 60 * 1000);
            } else {
                Swal.fire({ icon: 'error', title: 'ไม่สามารถสร้าง QR Code ได้' });
            }
        } catch (err) {
            console.error("Error generating QR code:", err);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาดในการสร้าง QR Code',
                text: 'กรุณาลองใหม่อีกครั้ง'
            });
        } finally {
            setIsGeneratingQR(false);
        }
    } else {
        // ไม่มี PromptPay
        setQrCodeImage('');
        setQrCodeExpiry(null);
    }

    setCurrentStep(2);
};


    const handleRegenerateQR = async () => {
        if (orderDetails) {
            setIsGeneratingQR(true);
            try {
                const response = await axios.post(HOSTNAME + '/souvenir/generateQR', {
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

            let addressIdToUse = selectedAddressId;

            // console.log("เบอร์:", phoneForOrder, profilePhone);
            // ถ้าเป็นการเพิ่มที่อยู่ใหม่
            if (isAddingNewAddress) {
                const newAddress = {
                    user_id: userId,
                    shippingAddress: deliveryAddress,
                    province_name: provinceName,
                    district_name: districtName,
                    sub_district_name: subDistrictName,
                    province_id: selectedProvince,
                    district_id: selectedDistrict,
                    sub_district_id: selectedSubDistrict,
                    zip_code: zipCode,
                    phone: phoneForOrder,
                    is_default: isDefault ? 1 : 0
                };

                const res = await axios.post(
                    HOSTNAME + "/souvenir/user/shippingAddress",
                    newAddress
                );

                addressIdToUse = res.data.user_addresses_id;
                setSelectedAddressId(addressIdToUse);

                // ตั้ง default ถ้าเลือก
                if (isDefault) {
                    await axios.post(
                        HOSTNAME + "/souvenir/user/shippingAddress/default",
                        { user_id: userId, user_addresses_id: addressIdToUse }
                    );
                }
            }

            // ถ้าไม่มี address เลย (ครั้งแรก) ให้อัตโนมัติเป็น default
            if (!addressIdToUse) {
                Swal.fire({ icon: 'error', title: 'ที่อยู่ไม่ถูกต้อง', confirmButtonText: 'ตกลง' });
                setIsProcessing(false);
                return;
            }

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
            formData.append('user_addresses_id', addressIdToUse);
            formData.append('paymentSlip', paymentSlip);
            formData.append('promptpay_number', items[0].promptpay_number);
            formData.append('phone', phoneForOrder || profilePhone || "");

            await axios.post(HOSTNAME + "/souvenir/checkout", formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            Swal.fire({ icon: 'success', title: 'สั่งซื้อสินค้าสำเร็จ กรุณารอการตรวจสอบการชำระเงิน', confirmButtonText: 'ตกลง' });
            localStorage.removeItem('selectedItems');

            // นำทางไปหน้าประวัติ
            // const userRole = localStorage.getItem("userRole");
            const userRole = user?.role;
            if (userRole === 3) navigate("/alumni-profile/alumni-profile-souvenir");
            else if (userRole === 4) navigate("/student-profile/student-profile-souvenir");
            else if (userRole === 2) navigate("/president-profile/president-profile-souvenir");
            else navigate("/");

        } catch (error) {
            console.error("Error during checkout:", error);
            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาดในการชำระเงิน', text: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

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
                                                                src={HOSTNAME + `/uploads/${item.image}`}
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
                                    ข้อมูลการจัดส่ง
                                </h5>
                            </div>
                            <div className="card-body">

                                <small className="text-muted d-block mb-2">ที่อยู่จัดส่ง</small>

                                {/* ที่อยู่หลัก */}
                                {defaultAddr ? (
                                    <div
                                        className="mb-3 p-3 border rounded bg-white d-flex justify-content-between align-items-center shadow-sm"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowAllAddresses(!showAllAddresses)}
                                    >
                                        {/* ปุ่ม radio */}
                                        <input
                                            type="radio"
                                            name="selectedAddress"
                                            checked={selectedAddressId === defaultAddr.user_addresses_id}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                if (selectedAddressId === defaultAddr.user_addresses_id) {
                                                    setSelectedAddressId(null);
                                                    setDeliveryAddress("");
                                                    setSelectedProvince("");
                                                    setSelectedDistrict("");
                                                    setSelectedSubDistrict("");
                                                    setZipCode("");
                                                    setPhoneForOrder("");
                                                    setIsDefault(false);
                                                    setIsAddingNewAddress(false);
                                                } else {
                                                    setSelectedAddressId(defaultAddr.user_addresses_id);
                                                    setDeliveryAddress(defaultAddr.shippingAddress || "");
                                                    setSelectedProvince(defaultAddr.province_id || "");
                                                    setSelectedDistrict(defaultAddr.district_id || "");
                                                    setSelectedSubDistrict(defaultAddr.sub_district_id || "");
                                                    setZipCode(defaultAddr.zip_code || "");
                                                    setPhoneForOrder(defaultAddr.phone || "");
                                                    setIsDefault(true);
                                                    setIsAddingNewAddress(false);
                                                }
                                            }}
                                            className="form-check-input me-3 mt-2"
                                            style={{ width: "1.2rem", height: "1.2rem" }}
                                        />

                                        {/* ข้อมูลที่อยู่ */}
                                        <div>
                                            <p className="mb-1 fw-semibold">
                                                <span className="mb-1 fw-light fs-6 text-secondary">
                                                    (+66) {defaultAddr.phone || "ไม่ระบุ"}
                                                </span>
                                            </p>
                                            <p className="mb-0">{formatFullAddress(defaultAddr)}</p>
                                            <span className="badge bg-success mt-1">เริ่มต้น</span>
                                        </div>

                                        {/* ปุ่มแก้ไข */}
                                        <div className="d-flex flex-column align-items-end">
                                            <button
                                                className="btn btn-sm btn-outline-secondary mb-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditAddress(defaultAddr);
                                                    setShowAllAddresses(false);
                                                }}
                                            >
                                                แก้ไข
                                            </button>
                                        </div>

                                        <div>
                                            {showAllAddresses ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>

                                ) : (
                                    <p className="text-muted">ยังไม่มีที่อยู่เริ่มต้น</p>
                                )}

                                {/* ที่อยู่อื่น ๆ */}
                                {showAllAddresses && (
                                    <>
                                        {otherAddresses.map(addr => (
                                            <div
                                                key={addr.user_addresses_id}
                                                className={`mb-3 p-2 border rounded bg-white d-flex justify-content-between align-items-center shadow-sm ${selectedAddressId === addr.user_addresses_id ? "border-primary bg-light" : ""
                                                    }`}
                                            >
                                                <div className="d-flex align-items-start">
                                                    {/* ปุ่ม radio */}
                                                    <input
                                                        type="radio"
                                                        name="selectedAddress"
                                                        checked={selectedAddressId === addr.user_addresses_id}
                                                        onChange={() => {
                                                            if (selectedAddressId === addr.user_addresses_id) {
                                                                setSelectedAddressId(null);
                                                                setDeliveryAddress("");
                                                                setSelectedProvince("");
                                                                setSelectedDistrict("");
                                                                setSelectedSubDistrict("");
                                                                setZipCode("");
                                                                setPhoneForOrder("");
                                                                setIsDefault(false);
                                                            } else {
                                                                setSelectedAddressId(addr.user_addresses_id);
                                                                setDeliveryAddress(addr.shippingAddress || "");
                                                                setSelectedProvince(addr.province_id || "");
                                                                setSelectedDistrict(addr.district_id || "");
                                                                setSelectedSubDistrict(addr.sub_district_id || "");
                                                                setZipCode(addr.zip_code || "");
                                                                setPhoneForOrder(addr.phone || "");
                                                                setIsDefault(false);
                                                            }
                                                        }}
                                                        className="form-check-input me-3 mt-2"
                                                        style={{ width: "1.2rem", height: "1.2rem" }}
                                                    />

                                                    {/* ข้อมูลที่อยู่ */}
                                                    <div>
                                                        <p className="mb-1 fw-semibold">
                                                            <span className="mb-1 fw-light fs-6 text-secondary">
                                                                (+66) {addr.phone || "ไม่ระบุ"}
                                                            </span>
                                                        </p>
                                                        <p className="mb-0">{formatFullAddress(addr)}</p>
                                                    </div>
                                                </div>

                                                {/* ปุ่มแก้ไข */}
                                                <div className="d-flex flex-column align-items-end">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary mb-1"
                                                        onClick={() => {
                                                            handleEditAddress(addr);
                                                            setShowAllAddresses(false);
                                                        }}
                                                    >
                                                        แก้ไข
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* ปุ่มเพิ่มที่อยู่ใหม่*/}
                                        {!isAddingNewAddress && (
                                            <button
                                                className="btn btn-sm btn-success w-100 mt-2"
                                                onClick={() => {
                                                    setIsAddingNewAddress(true);
                                                    setShowAllAddresses(false);
                                                    setSelectedAddressId(null);
                                                    setIsDefault(userAddresses.length === 0);
                                                    setDeliveryAddress("");
                                                    setSelectedProvince("");
                                                    setSelectedDistrict("");
                                                    setSelectedSubDistrict("");
                                                    setZipCode("");
                                                    setPhoneForOrder("");
                                                }}
                                            >
                                                <IoAdd /> เพิ่มที่อยู่ใหม่
                                            </button>
                                        )}
                                    </>
                                )}
                                {/* ปุ่มเพิ่มที่อยู่ใหม่*/}
                                {!isDefault && (
                                    <button
                                        className="btn btn-sm btn-success w-100 mt-2"
                                        onClick={() => {
                                            setIsAddingNewAddress(true);
                                            setShowAllAddresses(false);
                                            setSelectedAddressId(null);
                                            setIsDefault(userAddresses.length === 0);
                                            setDeliveryAddress("");
                                            setSelectedProvince("");
                                            setSelectedDistrict("");
                                            setSelectedSubDistrict("");
                                            setZipCode("");
                                            setPhoneForOrder("");
                                        }}
                                    >
                                        <IoAdd /> เพิ่มที่อยู่ใหม่
                                    </button>
                                )}

                                {/* ฟอร์มเพิ่ม/แก้ไขที่อยู่ */}
                                {isAddingNewAddress && (
                                    <div className="card mt-3 shadow-sm p-3 position-relative border-primary">
                                        {/* ปุ่ม Close */}
                                        <button
                                            type="button"
                                            className="btn-close position-absolute top-0 end-0 m-2"
                                            onClick={() => {
                                                setIsAddingNewAddress(false);
                                                setSelectedAddressId(null);
                                            }}
                                            aria-label="Close"
                                        ></button>

                                        {/* หัวเรื่อง */}
                                        <h6 className="fw-bold mb-3">
                                            {selectedAddressId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                                        </h6>

                                        {/* ฟอร์มที่อยู่ */}
                                        <div className="mb-2">
                                            <label className="form-label fw-semibold">รายละเอียดที่อยู่</label>
                                            <textarea
                                                className="form-control w-100"
                                                rows={3}
                                                placeholder="บ้านเลขที่ หมู่ ถนน ฯลฯ"
                                                value={deliveryAddress}
                                                onChange={e => setDeliveryAddress(e.target.value)}
                                            />
                                        </div>

                                        <div className="row g-2 mb-2 ">
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">จังหวัด</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedProvince}
                                                    onChange={e => setSelectedProvince(e.target.value)}
                                                >
                                                    <option value="">-- เลือกจังหวัด --</option>
                                                    {sortedProvinces.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name_th}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">อำเภอ</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedDistrict}
                                                    onChange={e => setSelectedDistrict(e.target.value)}
                                                    disabled={!selectedProvince}
                                                >
                                                    <option value="">-- เลือกอำเภอ --</option>
                                                    {sortedDistricts.map(d => (
                                                        <option key={d.id} value={d.id}>{d.name_th}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">ตำบล</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedSubDistrict}
                                                    onChange={e => setSelectedSubDistrict(e.target.value)}
                                                    disabled={!selectedDistrict}
                                                >
                                                    <option value="">-- เลือกตำบล --</option>
                                                    {sortedSubDistricts.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name_th}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <label className="form-label fw-semibold">รหัสไปรษณีย์</label>
                                            <input type="text" className="form-control w-100" value={zipCode} readOnly />
                                        </div>

                                        <div className="mb-2">
                                            <label className="form-label fw-semibold ">หมายเลขโทรศัพท์</label>
                                            <input
                                                type="tel"
                                                className="form-control w-100"
                                                value={phoneForOrder}
                                                placeholder={profilePhone ? `เช่น ${profilePhone}` : "กรอกเบอร์โทร 10 หลัก"}
                                                onChange={e => setPhoneForOrder(e.target.value)}
                                            />
                                            {profilePhone && (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary mt-2"
                                                    onClick={() => setPhoneForOrder(profilePhone)}
                                                >
                                                    ใช้เบอร์จากโปรไฟล์
                                                </button>
                                            )}
                                        </div>

                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={isDefault}
                                                onChange={e => setIsDefault(e.target.checked)}
                                                id="defaultAddress"
                                            />
                                            <label className="form-check-label" htmlFor="defaultAddress">
                                                ใช้เป็นที่อยู่เริ่มต้น
                                            </label>
                                        </div>

                                        {/* ปุ่มล่าง */}
                                        <div className="d-flex gap-2">
                                            {selectedAddressId ? (
                                                <>
                                                    <button
                                                        className="btn btn-danger flex-fill"
                                                        onClick={() => handleDeleteAddress(selectedAddressId)}
                                                    >
                                                        ลบที่อยู่
                                                    </button>
                                                    <button className="btn btn-primary flex-fill" onClick={handleSaveAddress}>
                                                        บันทึกการแก้ไข
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-secondary flex-fill"
                                                        onClick={() => {
                                                            setIsAddingNewAddress(false);
                                                            setSelectedAddressId(null);
                                                        }}
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                    <button className="btn btn-primary flex-fill" onClick={handleSaveAddress}>
                                                        เพิ่มที่อยู่
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

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
                                            ดำเนินการชำระเงิน
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            // </div>
        );
    };

    // ส่วนชำระเงินและแนบสลิปให้ใช้สินค้าทั้งกลุ่ม
    const renderPaymentStep = () => {
        const items = getCurrentProducts();
        const first = items[0];
        const isOfficial = Number(first?.is_official) === 1;

        // ตรวจสอบว่ามีข้อมูลบัญชีหรือไม่
        const hasBankInfo = Boolean(
            (isOfficial && orderDetails?.bankInfo?.account_number) ||
            (!isOfficial && (first?.account_number && first?.bank_name))
        );

        return (
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card-body">
                        <div className="row">
                            {/* สรุปคำสั่งซื้อ */}
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header bg-primary text-white text-center">
                                        <h5 className="mb-0">สรุปคำสั่งซื้อ</h5>
                                    </div>
                                    <div className="card-body">
                                        {items.map(item => (
                                            <div key={item.product_id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                                                <div>
                                                    <span className="fw-bold fs-5">{item.product_name}</span>
                                                    <br />
                                                    <span className="text-primary fw-semibold">฿{item.price.toLocaleString()}</span>
                                                    <br />
                                                    <span className="text-muted">จำนวน: {item.quantity}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {/* ที่อยู่จัดส่ง */}
                                        {(deliveryAddress || selectedProvince || selectedDistrict || selectedSubDistrict) && (
                                            <div className="mt-3 pt-3 border-top">
                                                <h6 className="fw-bold mb-1">ที่อยู่จัดส่ง:</h6>
                                                <p className="mb-0 text-muted">
                                                    {`${deliveryAddress} ต.${subDistrictName} อ.${districtName} จ.${provinceName} ${zipCode}`}
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-3 pt-3 border-top">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0 fw-bold">ยอดรวมทั้งหมด:</h5>
                                                <h4 className="mb-0 text-primary fw-semibold">฿{getCurrentProductsTotal().toFixed(2)}</h4>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* ช่องทางการชำระเงิน */}
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-header bg-primary text-white text-center">
                                        <h5 className="mb-0">ช่องทางการชำระเงิน</h5>
                                    </div>
                                    <div className="card-body text-center">
                                        {/* ถ้าเป็นสินค้าสมาคม ไม่แสดง QR */}
                                        {(() => {
    
                                            if (!orderDetails?.bankInfo) {
                                                return (
                                                    <div className="border border-2 border-dashed rounded p-4 mb-3">
                                                        <h6 className="text-muted">ไม่พบข้อมูลการชำระเงิน</h6>
                                                        <p className="text-muted mb-0">
                                                            <small>กรุณาติดต่อผู้ขายหรือผู้ดูแลระบบ</small>
                                                        </p>
                                                    </div>
                                                );
                                            }

                                if (orderDetails.bankInfo.promptpay_number) {
                                    // แสดง QR Code
                                    return (
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
                                                        <>สร้าง QR Code ใหม่</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                } else {
                                    // แสดงบัญชีธนาคาร
                                    return (
                                        <div className="border border-2 rounded p-3 mb-3 bg-white text-start">
                                            <h6 className="mb-3 text-center">โอนเข้าบัญชีธนาคาร</h6>

                                            <div className="mb-2">
                                                <small className="text-muted">ชื่อบัญชี</small>
                                                <div className="fw-semibold">{orderDetails.bankInfo.account_name || '-'}</div>
                                            </div>

                                            <div className="mb-2">
                                                <small className="text-muted">ธนาคาร</small>
                                                <div className="fw-semibold">{orderDetails.bankInfo.bank_name || '-'}</div>
                                            </div>

                                            <div className="mb-2">
                                <small className="text-muted">เลขที่บัญชี</small>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="fw-semibold flex-grow-1">{orderDetails.bankInfo.account_number || '-'}</div>
                                    <button
                                        className="btn btn-sm btn-link text-primary p-0"
                                        onClick={() => {
                                            navigator.clipboard.writeText(orderDetails.bankInfo.account_number)
                                                .then(() => {
                                                    setCopiedField('account_number');
                                                    setTimeout(() => setCopiedField(null), 2000);
                                                })
                                                .catch(err => console.error('Failed to copy:', err));
                                        }}
                                        disabled={!orderDetails.bankInfo.account_number || orderDetails.bankInfo.account_number === '-'}
                                        title="คัดลอกเลขที่บัญชี"
                                        style={{ fontSize: '18px' }}
                                    >
                                        {copiedField === 'account_number' ? (
                                            <FiCheck className="text-success" />
                                        ) : (
                                            <FiCopy />
                                        )}
                                    </button>
                                </div>
                            </div>

                                            <div className="mt-3 pt-2 border-top">
                                                <small className="text-primary">โอนเงินแล้วแนบสลิปในขั้นตอนถัดไป</small>
                                            </div>
                                        </div>
                                    );
                                }
                            })()}



                                        <div className="alert alert-info">
                                            <small>
                                                <strong>คำแนะนำ:</strong><br />
                                                {!isOfficial && qrCodeImage ? (
                                                    <>
                                                        1. เปิดแอปธนาคารมือถือ<br />
                                                        2. เลือกโอนเงิน สแกน QR<br />
                                                        3. สแกน QR Code ด้านบน<br />
                                                        4. ตรวจสอบจำนวนเงินและโอน<br />
                                                        5. บันทึกสลิปสำหรับขั้นตอนถัดไป
                                                    </>
                                                ) : (
                                                    <>
                                                        1. เปิดแอปธนาคารมือถือ<br />
                                                        2. เลือกโอนเงิน<br />
                                                        3. ระบุข้อมูลบัญชีด้านบน<br />
                                                        4. โอนจำนวนเงิน ฿{getCurrentProductsTotal().toFixed(2)}<br />
                                                        5. บันทึกสลิปสำหรับขั้นตอนถัดไป
                                                    </>
                                                )}
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
                                disabled={!orderDetails?.bankInfo || orderDetails.bankInfo.account_name === '-'}
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
                                                {(deliveryAddress || selectedProvince || selectedDistrict || selectedSubDistrict) && (
                                                    <div className="ms-2 mt-1">
                                                        <p className="mb-0 text-muted">{`${deliveryAddress} ต.${subDistrictName} อ.${districtName} จ.${provinceName} ${zipCode}`}</p>
                                                    </div>
                                                )}
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