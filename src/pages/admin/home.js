import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdNotifications } from "react-icons/md";
import { Badge, IconButton, Snackbar, Alert } from "@mui/material"; 
import "../../css/admin.css";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

function AdminHome() {
    // State สำหรับแจ้งเตือน
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info"
    });
    const [notificationCount, setNotificationCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [alumniCount, setAlumniCount] = useState(0);
    // const [donationCount, setDonationCount] = useState(0);
    // const [ongoingProject, setOngoingProject] = useState(0);
    // const [ongoingActivity, setOngoingActivity] = useState(0);
    // const [totalParticipants, setTotalParticipants] = useState(0);
    const [stats, setStats] = useState({
        totalParticipants: 0,
        ongoingActivity: 0,
        ongoingProject: 0,
        totalDonations: 0,
      });
    const [barData, setBarData] = useState({
        labels: [],
        datasets: [],
      });
      const [pieData, setPieData] = useState({
        labels: [],
        datasets: [],
      });
      
    useEffect(() => {
        // ดึงข้อมูลสถิติหลัก
        axios.get("http://localhost:3001/admin/dashboard-stats")
        .then((res) => {
            setStats(res.data);
            })
            .catch((err) => {
            console.error("Error fetching dashboard stats:", err);
        });

        // ดึงข้อมูลกราฟแท่ง
        axios.get('http://localhost:3001/admin/activity-per-year')
        .then(res => {
            console.log("กิจกรรมต่อปี", res.data);
            if (Array.isArray(res.data)) {
            const labels = res.data.map(item => `ปี ${item.year + 543}`);
            const data = res.data.map(item => item.total_activities);
            setBarData({
                labels,
                datasets: [{ label: 'จำนวนผู้เข้าร่วม (คน)', data, backgroundColor: '#0d6efd' }],
            });
            }
        });

    
        // ดึงข้อมูลกราฟวงกลม
        // axios.get('http://localhost:3001/admin/donation-stats')
        // .then(res => {
        //     if (res.data && Array.isArray(res.data)) {
        //     const labels = res.data.map(item => `ไตรมาส ${item.quarter}`);
        //     const data = res.data.map(item => item.total);
        //     setPieData({
        //         labels,
        //         datasets: [{
        //         data,
        //         backgroundColor: ['#d63384', '#198754', '#fd7e14', '#0dcaf0'],
        //         }],
        //     });
        //     } else {
        //     console.warn("donation-stats: unexpected data format", res.data);
        //     }
        // });
    
        // ดึงจำนวนศิษย์เก่า
        axios.get('http://localhost:3001/admin/total-alumni')
          .then(res => setAlumniCount(res.data.totalAlumni));
    }, []);

    // // แจ้งเตือนจาก backend
    // useEffect(() => {
    //     axios.get("http://localhost:3001/admin/notifications")
    //         .then(response => {
    //             setNotificationCount(response.data.unreadCount || 0);
    //         })
    //         .catch(error => {
    //             console.error("Error fetching notifications:", error);
    //         });
    // }, []);

    // // ฟังก์ชันปิดแจ้งเตือน
    // const handleCloseNotification = () => {
    //     setNotification({ ...notification, open: false });
    // };


    const CardInfo = ({ title, value, center = false }) => (
        <div className="col-md-3 mb-3">
          <div className={`card p-3 text-${center ? 'center' : 'start'}`}>
            <h6>{title}</h6>
            <h3 className="text-primary">{value}</h3>
          </div>
        </div>
      );
    
  
    const barOptions = {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 50,
              callback: value => `${value} คน`,
            },
            grid: {
              color: '#e0e0e0',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      };
      
      const pieOptions = {
        responsive: true,
        plugins: {
          legend: {
            position: 'left',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const value = tooltipItem.raw;
                const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
                const percent = ((value / total) * 100).toFixed(1);
                return `${tooltipItem.label} (${percent}%)`;
              },
            },
          },
        },
      };
      
    return (
        <>
          
            {/* <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity}>
                    {notification.message}
                </Alert>
            </Snackbar>

          
            <IconButton
                color="inherit"
                onClick={() => setNotificationCount(0)} 
            >
                <Badge badgeContent={notificationCount} color="error">
                    <MdNotifications size={24} />
                </Badge>
            </IconButton> */}

      <div className="container mt-4">
          <h3>Dashboard</h3>
        <div className="row mb-3">
          <CardInfo title="จำนวนผู้เข้าร่วมกิจกรรมทั้งหมด" value={`${stats.totalParticipants} คน`} />
          <CardInfo title="กิจกรรมที่กำลังดำเนินการ" value={`${stats.ongoingActivity} กิจกรรม`} />
          <CardInfo title="ยอดบริจาครวมทั้งหมด" value={`${stats.totalDonations} บาท`} />
          <CardInfo title="โครงการที่เปิดรับบริจาค" value={`${stats.ongoingProject} โครงการ`} />
        </div>

        <div className="row mb-4">
          <div className="col-md-8">
            <div className="card p-3">
              <h5>จำนวนการเข้าร่วมกิจกรรมในแต่ละปี</h5>
              {barData.labels.length ? <Bar data={barData} options={barOptions} /> : <div>Loading...</div>}
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3">
              <h5>สถิติการบริจาค</h5>
              {pieData.labels.length ? <Pie data={pieData} options={pieOptions} /> : <div>Loading...</div>}
            </div>
          </div>
        </div>

        <div className="row">
          <CardInfo title="จำนวนศิษย์เก่าทั้งหมด" value={`${alumniCount} คน`} center />
        </div>
      </div>
    </>
    );  
}

export default AdminHome;
