import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, Check, X, AlertTriangle, Scan, Shield, Clock } from 'lucide-react';

const DonationOCRSystem = () => {
  const [projectData] = useState({
    project_name: "โครงการช่วยเหลือน้ำท่วม",
    current_amount: 125000,
    target_amount: 500000,
    description: "โครงการช่วยเหลือผู้ประสบภัยน้ำท่วมในพื้นที่ภาคเหนือ",
    image_path: "default.png",
    donation_type: "money"
  });

  const [formData, setFormData] = useState({
    amount: '',
    name: '',
    address: '',
    taxId: ''
  });

  const [ocrData, setOcrData] = useState({
    isProcessing: false,
    detectedAmount: null,
    detectedDate: null,
    detectedRef: null,
    confidence: 0,
    status: 'idle' // idle, processing, success, error
  });

  const [showTaxForm, setShowTaxForm] = useState(false);
  const [qrCode] = useState("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0Ij5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4=");
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const progress = projectData.target_amount > 0 
    ? (projectData.current_amount / projectData.target_amount) * 100 
    : 0;

  // Mock OCR function - ในการใช้งานจริงจะเชื่อมต่อกับ OCR API
  const performOCR = async (imageData) => {
    setOcrData({ ...ocrData, isProcessing: true, status: 'processing' });
    
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR results
    const mockResults = {
      amount: Math.floor(Math.random() * 5000) + 100,
      date: new Date().toLocaleDateString('th-TH'),
      ref: `REF${Math.random().toString(36).substr(2, 9)}`,
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };

    setOcrData({
      isProcessing: false,
      detectedAmount: mockResults.amount,
      detectedDate: mockResults.date,
      detectedRef: mockResults.ref,
      confidence: mockResults.confidence,
      status: mockResults.confidence > 0.8 ? 'success' : 'error'
    });

    // Auto-fill amount if confidence is high
    if (mockResults.confidence > 0.8) {
      setFormData(prev => ({ ...prev, amount: mockResults.amount.toString() }));
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('ไม่สามารถเข้าถึงกล้องได้');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Convert to blob and perform OCR
      canvas.toBlob(async (blob) => {
        const reader = new FileReader();
        reader.onload = () => performOCR(reader.result);
        reader.readAsDataURL(blob);
      });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => performOCR(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTaxOptionChange = (e) => {
    setShowTaxForm(e.target.value === 'yes');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    if (ocrData.status !== 'success' && !ocrData.detectedAmount) {
      alert('กรุณาอัปโหลดสลิปการโอนเงินและรอการตรวจสอบให้เสร็จสิ้น');
      return;
    }

    // Submit donation
    alert('บริจาคเรียบร้อยแล้ว ขอบคุณสำหรับความกรุณาของคุณ');
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
  <div className="container py-5 bg-light min-vh-100">
    <div className="row g-4">
      
      {/* Project Information */}
      <div className="col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title">{projectData.project_name}</h2>

            <div className="mb-4 text-center bg-secondary-subtle rounded p-4">
              <span className="text-muted">รูปภาพโครงการ</span>
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between small">
                <span>ความคืบหน้า</span>
                <strong className="text-primary">{progress.toFixed(1)}%</strong>
              </div>
              <div className="progress">
                <div className="progress-bar bg-success" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="mb-3 small">
              <div className="d-flex justify-content-between">
                <span>ยอดบริจาคปัจจุบัน:</span>
                <strong className="text-success">{projectData.current_amount.toLocaleString()} บาท</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>เป้าหมาย:</span>
                <strong>{projectData.target_amount.toLocaleString()} บาท</strong>
              </div>
            </div>

            <div className="alert alert-primary">
              <h6>รายละเอียดโครงการ</h6>
              <p className="mb-0 small">{projectData.description}</p>
            </div>

            <div className="text-center bg-light border rounded p-3">
              <div className="d-flex align-items-center justify-content-center mb-2">
                <Scan size={18} className="me-2 text-primary" />
                <span className="fw-medium">QR PromptPay</span>
              </div>
              <img src={qrCode} alt="QR Code" className="img-fluid" style={{ width: '130px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Donation Form */}
      <div className="col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="card-title mb-4">ฟอร์มบริจาค</h4>

            <form>
              {/* Amount Input */}
              <div className="mb-3">
                <label className="form-label">จำนวนเงิน</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="กรอกจำนวนเงิน"
                />
              </div>

              {/* OCR & Upload */}
              <div className="border border-2 border-dashed rounded p-4 mb-3">
                <div className="text-center mb-3">
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    <Shield size={18} className="me-2 text-success" />
                    <span>อัปโหลดสลิปการโอนเงิน (OCR เรียลไทม์)</span>
                  </div>
                  <small className="text-muted">ระบบจะตรวจสอบข้อมูลอัตโนมัติ</small>
                </div>

                {/* Camera */}
                <div className="mb-3">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={startCamera}
                    >
                      <Camera size={16} className="me-2" />
                      เปิดกล้องถ่าย
                    </button>
                  ) : (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="w-100 rounded mb-3" />
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-success w-50" onClick={captureImage}>
                          <Scan size={16} className="me-2" /> ถ่ายภาพ
                        </button>
                        <button type="button" className="btn btn-danger w-50" onClick={stopCamera}>
                          <X size={16} className="me-2" /> ปิดกล้อง
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* File Upload */}
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="d-none"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} className="me-2" />
                    เลือกไฟล์จากอุปกรณ์
                  </button>
                </div>

                {/* OCR Result */}
                {ocrData.status !== 'idle' && (
                  <div className="border rounded p-3">
                    {ocrData.isProcessing ? (
                      <div className="text-primary d-flex align-items-center">
                        <Clock className="me-2 spinner-border spinner-border-sm" />
                        <span>กำลังประมวลผล OCR...</span>
                      </div>
                    ) : ocrData.status === 'success' ? (
                      <>
                        <div className="text-success d-flex align-items-center mb-2">
                          <Check size={16} className="me-2" />
                          ตรวจสอบสำเร็จ (ความแม่นยำ: {(ocrData.confidence * 100).toFixed(1)}%)
                        </div>
                        <ul className="list-unstyled small">
                          <li><strong>จำนวนเงิน:</strong> {ocrData.detectedAmount?.toLocaleString()} บาท</li>
                          <li><strong>วันที่:</strong> {ocrData.detectedDate}</li>
                          <li><strong>หมายเลขอ้างอิง:</strong> {ocrData.detectedRef}</li>
                        </ul>
                      </>
                    ) : (
                      <div className="text-danger d-flex align-items-center">
                        <AlertTriangle className="me-2" />
                        ไม่สามารถตรวจสอบข้อมูลได้ กรุณาลองใหม่
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tax Receipt Option */}
              <div className="mb-3">
                <label className="form-label">ใบกำกับภาษี</label>
                <div className="form-check">
                  <input
                    type="radio"
                    name="tax"
                    value="no"
                    onChange={handleTaxOptionChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">ไม่ต้องการ</label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    name="tax"
                    value="yes"
                    onChange={handleTaxOptionChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">ต้องการ</label>
                </div>
              </div>

              {/* Tax Form */}
              {showTaxForm && (
                <div className="bg-light p-3 rounded mb-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ชื่อบริษัท/นิติบุคคล*"
                    className="form-control mb-2"
                  />
                  <textarea
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="ที่อยู่*"
                    className="form-control mb-2"
                  />
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    placeholder="เลขประจำตัวผู้เสียภาษี*"
                    className="form-control"
                  />
                </div>
              )}

              <button type="submit" className="btn btn-success w-100">
                บริจาคเลย
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    {/* ซ่อน canvas สำหรับจับภาพกล้อง */}
    <canvas ref={canvasRef} style={{ display: 'none' }} />
  </div>
);
};

export default DonationOCRSystem;