import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import "../../css/verify.css";
import { HOSTNAME } from '../../config.js';

function ProductSlots() {
    const { productId } = useParams();
    const [slots, setSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({
        slot_name: "",
        quantity: "",
    });
    const [editSlot, setEditSlot] = useState(null); // เก็บ slot ที่กำลังแก้ไข
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSlots();
    }, [productId]);

    const fetchSlots = async () => {
        try {
            const res = await axios.get(HOSTNAME + `/admin/product-slots/${productId}`);
            setSlots(res.data);
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด!", "ไม่สามารถดึงข้อมูลสล็อตได้", "error");
        }
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        if (newSlot.quantity <= 0) {
            Swal.fire("ผิดพลาด!", "จำนวนสินค้าต้องมากกว่า 0", "error");
            return;
        }
        try {
            await axios.post(HOSTNAME + `/admin/products/add-slot/${productId}`, newSlot);
            Swal.fire("สำเร็จ!", "เพิ่มสล็อตสินค้าเรียบร้อยแล้ว", "success");
            setNewSlot({ slot_name: "", quantity: "" });
            setShowModal(false);
            fetchSlots();
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด!", "ไม่สามารถเพิ่มสล็อตได้", "error");
        }
    };

    const handleDeleteSlot = async (slotId) => {
        Swal.fire({
            title: "ยืนยันการลบ?",
            text: "คุณต้องการลบสล็อตนี้จริงหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(HOSTNAME + `/admin/products/delete-slot/${slotId}`);
                    Swal.fire("ลบแล้ว!", "สล็อตถูกลบเรียบร้อย", "success");
                    fetchSlots();
                } catch (err) {
                    console.error(err);
                    Swal.fire("ผิดพลาด!", "ไม่สามารถลบสล็อตได้", "error");
                }
            }
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(HOSTNAME + `/admin/products/edit-slot/${editSlot.slot_id}`, editSlot);
            Swal.fire("สำเร็จ!", "แก้ไขสล็อตเรียบร้อยแล้ว", "success");
            setEditSlot(null); // ปิด modal
            fetchSlots();
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด!", "ไม่สามารถแก้ไขสล็อตได้", "error");
        }
    };

    return (
        <div className="container p-4">
            <h3 className="admin-title">ล็อตสินค้า</h3>
            <div className="col-md-2 d-flex align-items-end m-2 ms-auto">
                <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    onClick={() => setShowModal(true)}
                >
                    เพิ่มล็อตสินค้า
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-slot">
                        <form onSubmit={handleAddSlot}>
                            <div className="custom-modal-header">
                                <h5 className="text-bold">เพิ่มล็อตสินค้า</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="custom-modal-body row g-3">
                                <div className="col-md-6">
                                    <small className="text-muted">ชื่อล็อต</small>
                                    <input
                                        type="text"
                                        className="form-control w-100"
                                        placeholder="เช่น ล็อตที่ 1"
                                        value={newSlot.slot_name}
                                        onChange={(e) =>
                                            setNewSlot({ ...newSlot, slot_name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <small className="text-muted">จำนวนทั้งหมด</small>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control w-100"
                                        placeholder="จำนวนสินค้า"
                                        value={newSlot.quantity}
                                        onChange={(e) =>
                                            setNewSlot({ ...newSlot, quantity: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                            </div>
                            <div className="custom-modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary w-25"
                                    onClick={() => setShowModal(false)}
                                >
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-success w-25">
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ตาราง slot */}
            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>วันที่</th>
                        <th>ชื่อล็อต</th>
                        <th>จำนวนทั้งหมด</th>
                        <th>ขายไปแล้ว</th>
                        <th>คงเหลือ</th>
                        <th>สถานะ</th>
                        <th>การจัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {slots.map((slot) => {
                        const remaining = slot.quantity - slot.sold;
                        return (
                            <tr key={slot.slot_id}>
                                <td className="text-center">{slot.created_at ? new Date(slot.created_at).toLocaleDateString('th-TH') : '-'}</td>
                                <td>{slot.slot_name}</td>
                                <td className="text-center">{slot.quantity}</td>
                                <td className="text-center">{slot.sold}</td>
                                <td className="text-center">
                                    {remaining <= 5 ? (
                                        <span className="badge text-danger">ใกล้หมด ({remaining})</span>
                                    ) : (
                                        remaining
                                    )}
                                </td>

                                <td className="text-center">
                                    <span className={`badge ${slot.status === "active"
                                        ? "bg-success bg-opacity-10 text-success"
                                        : slot.status === "pending"
                                            ? "bg-warning bg-opacity-10 text-warning"
                                            : "bg-secondary bg-opacity-10 text-secondary"}`}>
                                        {slot.status === "active"
                                            ? "กำลังจำหน่าย"
                                            : slot.status === "pending"
                                                ? "ยังไม่จำหน่าย"
                                                : "สิ้นสุดการจำหน่าย"}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button
                                        className="btn btn-sm btn-outline-warning me-2"
                                        onClick={() => setEditSlot(slot)}
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteSlot(slot.slot_id)}
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {slots.length === 0 && <p className="text-muted text-center">ยังไม่มีล็อตสินค้า</p>}

            {/* Modal แก้ไข slot */}
            {editSlot && (
                <div className="custom-modal-overlay fade show d-block" tabIndex="-1">
                    <div className="custom-modal-slot">
                        {/* <div className="custom-edit-content"> */}
                        <form onSubmit={handleEditSubmit}>
                            <div className="custom-edit-header">
                                <h5 className="custom-edit-title">แก้ไขล็อต</h5>
                                <button type="button" className="btn-close" onClick={() => setEditSlot(null)}></button>
                            </div>
                            <div className="custom-edit-body">
                                <div className="mb-3">
                                    <label className="form-label">ชื่อล็อต</label>
                                    <input
                                        type="text"
                                        className="form-control w-100"
                                        value={editSlot.slot_name}
                                        onChange={(e) => setEditSlot({ ...editSlot, slot_name: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">จำนวนทั้งหมด</label>
                                    <input
                                        type="number"
                                        className="form-control w-100"
                                        value={editSlot.quantity}
                                        onChange={(e) => setEditSlot({ ...editSlot, quantity: e.target.value })}
                                        onBlur={() => {
                                            // ป้องกันติดลบตอนออกจาก input
                                            if (Number(editSlot.quantity) < 0) {
                                                setEditSlot({ ...editSlot, quantity: 0 });
                                            }
                                        }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">สถานะ</label>
                                    <select
                                        className="form-select"
                                        value={editSlot.status}
                                        onChange={(e) => setEditSlot({ ...editSlot, status: e.target.value })}
                                    >
                                        <option value="pending">ยังไม่จำหน่าย</option>
                                        <option value="active">กำลังจำหน่าย</option>
                                        <option value="completed">สิ้นสุดการจำหน่าย</option>
                                    </select>
                                </div>
                            </div>
                            <div className="custom-edit-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditSlot(null)}>ยกเลิก</button>
                                <button type="submit" className="btn btn-success">บันทึก</button>
                            </div>
                        </form>
                        {/* </div> */}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductSlots;
