import React, { useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useParams, useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";

function WebboardDetail() {
    const { webboardId } = useParams(); // ดึง ID ของกระทู้จาก URL
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // ดึงข้อมูลกระทู้และความคิดเห็น
    useEffect(() => {
        axios.get(`http://localhost:3001/web/webboard/${webboardId}`, {
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
            axios.delete(`http://localhost:3001/web/webboard/${post.webboard_id}/comment/${commentId}`, {
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

    if (loading) {
        return <p className="text-center mt-5">กำลังโหลดข้อมูล...</p>;
    }

    if (!post) {
        return <p className="text-center mt-5">ไม่พบข้อมูลกระทู้</p>;
    }

    return (
        <div className="container mt-4">
            {/* <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>ย้อนกลับ</button> */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h3 className="card-title">{post.title}</h3>
                    <p className="card-text text-muted">
                        หมวดหมู่: <strong>{post.category_name || "ไม่ระบุหมวดหมู่"}</strong> <br />
                        จากคุณ {post.full_name || "ไม่ระบุชื่อ"} <br />
                        วันที่โพสต์: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <p className="card-text">{post.content}</p>
                </div>
            </div>

            <h5>ความคิดเห็น ({comments.length})</h5>
            <div className="list-group">
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.comment_id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <p className="mb-1"><strong>{comment.full_name || "ไม่ระบุชื่อ"}</strong></p>
                                <p className="mb-1">{comment.comment_detail}</p>
                                <small className="text-muted">วันที่: {new Date(comment.created_at).toLocaleDateString()}</small>
                            </div>
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteComment(comment.comment_id)}
                            >
                                <MdDelete /> ลบ
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-muted">ยังไม่มีความคิดเห็น</p>
                )}
            </div>
        </div>
    );
}

export default WebboardDetail;