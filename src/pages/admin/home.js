import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdVolunteerActivism, MdEvent } from "react-icons/md";
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
import "../../css/admin.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

function AdminHome() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    ongoingActivity: 0,
    ongoingProject: 0,
    totalDonations: 0,
  });

  const [alumniCount, setAlumniCount] = useState(0);

  const [barData, setBarData] = useState({
    labels: [],
    datasets: [],
  });

  const [pieData, setPieData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    // Dashboard Stats
    axios.get("http://localhost:3001/admin/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching dashboard stats:", err));

    // Activity per year graph
    axios.get("http://localhost:3001/admin/activity-per-year")
      .then(res => {
        if (Array.isArray(res.data)) {
          const labels = res.data.map(item => `ปี ${item.year + 543}`);
          const data = res.data.map(item => item.total_activities);
          setBarData({
            labels,
            datasets: [{
              label: 'จำนวนกิจกรรม',
              data,
              backgroundColor: '#0d6efd'
            }],
          });
        }
      });

    // Donation statistics for pie chart
    // axios.get("http://localhost:3001/admin/donation-statistics")
    //   .then((res) => {
    //     const labels = res.data.map(item => item.category);
    //     const data = res.data.map(item => item.total_amount);
    //     setPieData({
    //       labels,
    //       datasets: [{
    //         data,
    //         backgroundColor: ['#28a745', '#6f42c1', '#ffc107'], // example colors
    //       }],
    //     });
    //   });

    // Total alumni count
    axios.get("http://localhost:3001/admin/total-alumni")
      .then(res => setAlumniCount(res.data.totalAlumni));
  }, []);

  const CardInfo = ({ title, value, type = "activity", center = false }) => {
    const isDonation = type === "donation";
    const Icon = isDonation ? MdVolunteerActivism : MdEvent;
    const bgColor = isDonation ? "bg-success-subtle" : "bg-primary-subtle";
    const textColor = isDonation ? "text-success" : "text-primary";

    return (
      <div className="col-md-3 mb-3">
        <div className={`card p-3 ${bgColor} ${center ? 'text-center' : 'text-start'}`}>
          <div className="d-flex align-items-center mb-2">
            <Icon size={24} className={textColor + " me-2"} />
            <h6 className="mb-0">{title}</h6>
          </div>
          <h3 className={textColor}>{value}</h3>
        </div>
      </div>
    );
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
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
    <div className="home-container p-5">
      <h3 className="admin-title">Dashboard</h3>

      <div className="row mb-3">
        <CardInfo title="จำนวนผู้เข้าร่วมกิจกรรมทั้งหมด" value={`${stats.totalParticipants} คน`} type="activity" />
        <CardInfo title="กิจกรรมที่กำลังดำเนินการ" value={`${stats.ongoingActivity} กิจกรรม`} type="activity" />
        <CardInfo title="ยอดบริจาครวมทั้งหมด" value={`${stats.totalDonations} บาท`} type="donation" />
        <CardInfo title="โครงการที่เปิดรับบริจาค" value={`${stats.ongoingProject} โครงการ`} type="donation" />
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
  );
}

export default AdminHome;
