import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useParams, useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import {HOSTNAME} from '../../config.js';

function WebboardDetail() {
    const { webboardId } = useParams(); // ดึง ID ของกระทู้จาก URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // ดึงข้อมูลกระทู้และความคิดเห็น
    useEffect(() => {
        axios.get(HOSTNAME +`/web/webboard/${webboardId}`, {
            withCredentials: true
        })
            .then((response) => {
                if (response.data.success) {
                    setPost(response.data.data);
                    setComments(response.data.data.comments || []);
                } else {
                    console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:", response.data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูลกระทู้:", error.message);
                setLoading(false);
            });
    }, [webboardId]);

    // ฟังก์ชันลบความคิดเห็น
    const handleDeleteComment = (commentId) => {
        if (window.confirm("คุณต้องการลบความคิดเห็นนี้หรือไม่?")) {
            axios.delete(HOSTNAME +`/web/webboard/${post.webboard_id}/comment/${commentId}`, {
                withCredentials: true
            })
                .then((response) => {
                    if (response.data.success) {
                        setComments(comments.filter(comment => comment.comment_id !== commentId));
                        alert("ลบความคิดเห็นสำเร็จ!");
                    } else {
                        alert("เกิดข้อผิดพลาดในการลบความคิดเห็น");
                    }
                })
                .catch((error) => {
                    console.error("เกิดข้อผิดพลาดในการลบความคิดเห็น:", error.message);
                });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "0000-00-00") return "ไม่ระบุวันที่";
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1; // เดือนเป็นเลข
        const year = date.getFullYear() + 543; // ปีไทย
        return `${day}/${month}/${year}`;
    };

    if (loading) {
        return <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>;
    }

    if (!post) {
        return <p className="text-center mt-5">ไม่พบข้อมูลกระทู้</p>;
    }


    return (
        <div className="webboard-container p-5">
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h3 className="card-title">{post.title}</h3>
                    <p className="card-text text-muted">
                        หมวดหมู่: <strong>{post.category_name || "ไม่ระบุหมวดหมู่"}</strong> <br />
                        จากคุณ {post.full_name || "ไม่ระบุชื่อ"} <br />
                        วันที่โพสต์: {formatDate(post.created_at)}
                    </p>
                    <p className="card-text">{post.content}</p>
                </div>
            </div>

            <h5 className="mb-3">ความคิดเห็น ({comments.length})</h5>

            {comments.map(comment => (
                <div key={comment.comment_id} className="list-group-item list-group-item-light shadow-sm rounded mb-3 p-3">
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex">
                            <div className="me-3">
                                <FaUserCircle size={35} className="text-secondary" />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-1">{comment.full_name || "ไม่ระบุชื่อ"}</h6>
                                <p className="mb-1">{comment.comment_detail}</p>
                                <small className="text-muted">วันที่: {formatDate(comment.created_at)}</small>
                            </div>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteComment(comment.comment_id)}
                        >
                            <MdDelete /> ลบ
                        </button>
                    </div>

                    {/* แสดง replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ms-5 border-start ps-3">
                            <strong className="text-muted">ตอบกลับ:</strong>
                            {comment.replies.map(reply => (
                                <div key={reply.reply_id} className="mt-2">
                                    <div className="d-flex align-items-center mb-1">
                                        <FaUserCircle size={25} className="text-secondary me-2" />
                                        <span className="fw-semibold">{reply.full_name || "ไม่ระบุชื่อ"}</span>
                                    </div>
                                    <div className="ps-4">
                                        <p className="mb-1">{reply.reply_detail}</p>
                                        <small className="text-muted">วันที่: {new Date(reply.created_at).toLocaleDateString()}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default WebboardDetail;