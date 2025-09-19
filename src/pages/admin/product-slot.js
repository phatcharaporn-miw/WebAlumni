import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";

function ProductSlots() {
    const { productId } = useParams();
    const [products, setProducts] = useState([]); // สินค้าทั้งหมด
    const [slots, setSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({
        slot_name: "",
        quantity: "",
        start_date: "",
        end_date: "",
    });

    useEffect(() => {
        axios.get('http://localhost:3001/admin/souvenir')
            .then(res => setProducts(res.data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetchSlots();
    }, [productId]);

    const fetchSlots = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/admin/product-slots/${productId}`);
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
            await axios.post(`http://localhost:3001/admin/products/add-slot/${productId}`, newSlot);
            Swal.fire("สำเร็จ!", "เพิ่มสล็อตสินค้าเรียบร้อยแล้ว", "success");
            setNewSlot({ slot_name: "", quantity: "", start_date: "", end_date: "" });
            fetchSlots();
        } catch (err) {
            console.error(err);
            Swal.fire("ผิดพลาด!", "ไม่สามารถเพิ่มสล็อตได้", "error");
        }
    };

    return (
        <div className="container p-4">
            <h3 className="admin-title">สล็อตสินค้า</h3>

            <form className="row g-3 mb-4" onSubmit={handleAddSlot}>

                {/* ช่อง 1: ชื่อล็อต */}
                <div className="col-md-3">
                    <small className="text-muted">ชื่อล็อต</small>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="ชื่อล็อต เช่น ล็อตที่ 1"
                        value={newSlot.slot_name}
                        onChange={(e) => setNewSlot({ ...newSlot, slot_name: e.target.value })}
                        required
                    />
                </div>

                {/* ช่อง 2: จำนวนสินค้า */}
                <div className="col-md-3">
                    <small className="text-muted">จำนวนทั้งหมด</small>
                    <input
                        type="number"
                        min="1"
                        className="form-control"
                        placeholder="จำนวนสินค้า"
                        value={newSlot.quantity}
                        onChange={(e) => setNewSlot({ ...newSlot, quantity: e.target.value })}
                        required
                    />
                </div>

                {/* ช่อง 3: วันที่เริ่ม */}
                <div className="col-md-3">
                    <small className="text-muted">วันที่เริ่ม</small>
                    <input
                        type="date"
                        className="form-control"
                        value={newSlot.start_date}
                        onChange={(e) => setNewSlot({ ...newSlot, start_date: e.target.value })}
                    />
                </div>

                {/* ช่อง 4: วันที่สิ้นสุด */}
                <div className="col-md-3">
                    <small className="text-muted">วันที่สิ้นสุด</small>
                    <input
                        type="date"
                        className="form-control"
                        value={newSlot.end_date}
                        onChange={(e) => setNewSlot({ ...newSlot, end_date: e.target.value })}
                    />
                </div>

                {/* ปุ่มเพิ่ม */}
                <div className="col-md-2">
                    <button type="submit" className="btn btn-success">เพิ่ม</button>
                </div>
            </form>


            {/* ตาราง slot */}
            <table className="table table-bordered">
                <thead className="table-light">
                    <tr>
                        <th>สินค้า</th>
                        <th>ชื่อล็อต</th>
                        <th>จำนวนทั้งหมด</th>
                        <th>ขายไปแล้ว</th>
                        <th>คงเหลือ</th>
                        <th>วันที่เริ่ม</th>
                        <th>วันที่สิ้นสุด</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    {slots.map((slot) => {
                        const remaining = slot.quantity - slot.sold;
                        return (
                            <tr key={slot.slot_id}>
                                <td className="fw-semibold">{slot.product_name}</td>
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
                                    {slot.start_date ? new Date(slot.start_date).toLocaleDateString('th-TH') : '-'}
                                </td>
                                <td className="text-center">
                                    {slot.end_date ? new Date(slot.end_date).toLocaleDateString('th-TH') : '-'}
                                </td>
                                <td className="text-center">
                                    <span className={`badge ${slot.status === "active" ? "bg-success bg-opacity-10 text-success" : "bg-secondary"}`}>
                                        {slot.status === "active" ? "กำลังจำหน่าย" : "ยังไม่จำหน่าย"}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {slots.length === 0 && <p className="text-muted text-center">ยังไม่มีสล็อตสินค้า</p>}
        </div>
    );
}

export default ProductSlots;