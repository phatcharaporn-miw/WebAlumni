import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdNotifications } from "react-icons/md";
import { Badge, IconButton, Snackbar, Alert } from "@mui/material"; 
import "../../css/admin.css";

function AdminHome() {
    // State สำหรับแจ้งเตือน
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info"
    });

    const [notificationCount, setNotificationCount] = useState(0);

    // โหลดข้อมูลแจ้งเตือนจาก API (สมมติว่ามี API `/admin/notifications`)
    useEffect(() => {
        axios.get("http://localhost:3001/admin/notifications")
            .then(response => {
                setNotificationCount(response.data.unreadCount || 0);
            })
            .catch(error => {
                console.error("Error fetching notifications:", error);
            });
    }, []);

    // ฟังก์ชันปิดแจ้งเตือน
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <>
            {/* Snackbar แจ้งเตือน */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* ปุ่มแจ้งเตือน */}
            <IconButton
                color="inherit"
                onClick={() => setNotificationCount(0)} 
            >
                <Badge badgeContent={notificationCount} color="error">
                    <MdNotifications size={24} />
                </Badge>
            </IconButton>

            {/* หัวข้อหน้า */}
            <h2 className="titlesouvenir">AdminHome (สำหรับผู้ดูแล)</h2>
            
        </>
    );
}

export default AdminHome;
