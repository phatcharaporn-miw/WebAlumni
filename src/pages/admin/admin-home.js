import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";

function AdminHome(){
    const navigate = useNavigate();

    return(
        <div className="title">
            <h2>Welcome to Admin page</h2>
             <button 
                                className="btn btn-primary w-100 mb-3" 
                                onClick={() => navigate ("/admin/activities/admin-create-news")}
                                >
                                เพิ่มข่าวประชาสัมพันธ์
                                </button>
             <button 
                                className="btn btn-primary w-100 mb-3" 
                                onClick={() => navigate ("/admin/activities/admin-create-activity")}
                                >
                                เพิ่มกิจกรรม
                                </button>
        </div>
    )
}

export default AdminHome;