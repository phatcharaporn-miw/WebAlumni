import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HOSTNAME } from '../../config.js';
import axios from "axios";
import { MdVolunteerActivism, MdEvent, MdPeople, MdTrendingUp } from "react-icons/md";
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
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    ongoingActivity: 0,
    ongoingProject: 0,
    totalDonations: 0,
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const [alumniCount, setAlumniCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    axios.get(HOSTNAME + "/admin/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching dashboard stats:", err));

    // Activity per month graph
    axios.get(HOSTNAME + "/admin/activity-per-month")
      .then(res => {
        if (Array.isArray(res.data)) {
          // สร้าง labels เป็น "เดือน ปี" (ภาษาไทย)
          const monthNamesThai = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
            "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
            "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
          ];

          const labels = res.data.map(item => `${monthNamesThai[item.month_number - 1]} ${item.year + 543}`);
          const data = res.data.map(item => item.total_activities);

          setBarData({
            labels,
            datasets: [{
              label: 'จำนวนกิจกรรม',
              data,
              backgroundColor: 'rgba(13, 110, 253, 0.8)',
              borderColor: 'rgba(13, 110, 253, 1)',
              borderWidth: 2,
              borderRadius: 6,
              borderSkipped: false,
            }],
          });
        }
      });


    // สถิติการบริจาค
    axios.get(HOSTNAME + "/admin/donation-stats")
      .then((res) => {
        const labels = res.data.map(item => item.donation_type);
        const data = res.data.map(item => item.total);
        setPieData({
          labels,
          datasets: [{
            data,
            backgroundColor: ['#98d662ff', '#6f42c1', '#241f12ff'],
            borderColor: ['#98d662ff', '#6f42c1', '#241f12ff'],
            borderWidth: 2,
          }],
        });
      });


    // Total alumni count
    axios.get(HOSTNAME + "/admin/total-alumni")
      .then(res => setAlumniCount(res.data.totalAlumni));
  }, []);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const CardInfo = ({ title, value, type = "activity", center = false, icon: CustomIcon, colClass = "col-md-3", onClick }) => {
    const getCardStyle = () => {
      switch (type) {
        case "donation":
          return {
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            iconColor: 'white'
          };
        case "project":
          return {
            background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
            color: 'white',
            iconColor: 'white'
          };
        case "alumni":
          return {
            background: 'linear-gradient(135deg, #fd7e14 0%, #ffc107 100%)',
            color: 'white',
            iconColor: 'white'
          };
        default:
          return {
            background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)',
            color: 'white',
            iconColor: 'white'
          };
      }
    };

    const cardStyle = getCardStyle();
    const Icon = CustomIcon || (type === "donation" ? MdVolunteerActivism : MdEvent);

    return (
      <div className={`${colClass} mb-4`}>
        <div
          onClick={onClick}
          className={`card p-4 border-0 shadow-lg position-relative overflow-hidden ${center ? 'text-center' : 'text-start'}`}
          style={{
            background: cardStyle.background,
            color: cardStyle.color,
            cursor: onClick ? "pointer" : "default",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* <div className="position-absolute top-0 end-0 p-3 opacity-25">
            <Icon size={60} />
          </div> */}
          <div className="d-flex align-items-center mb-3">
            <Icon size={28} className="me-3" style={{ color: cardStyle.iconColor }} />
            <h6 className="mb-0 fw-bold">{title}</h6>
          </div>
          <h2 className="fw-bold mb-0">{value}</h2>
          {onClick && (
            <small className="text-light opacity-75 mt-2 d-block">
              คลิกเพื่อดูรายละเอียด →
            </small>
          )}
        </div>
      </div>
    );
  };

  const LoadingSpinner = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          callback: value => `${value} กิจกรรม`,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold'
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function (tooltipItem) {
            const value = Number(tooltipItem.raw); // ยอดเงินของ slice นั้นแต่ละโครงการต้องแปลงเป็นตัวเลขก่อน
            const dataset = tooltipItem.dataset;

            // console.log('Tooltip Item:', dataset);
            // บังคับแปลงเป็นตัวเลข
            const dataValues = dataset.data.map(d => Number(d));

            // คำนวณผลรวมทั้งหมดของ slice
            const total = dataValues.reduce((acc, val) => acc + val, 0);

            // (ค่า slice ÷ ผลรวมทั้งหมด) × 100
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

            // format number ให้มี , คั่นหลักพัน
            const formattedValue = value.toLocaleString();
            return `${tooltipItem.label}: ฿${formattedValue} (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="container-fluid p-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="row mb-5">
        <div className="col-12">
          <h3 className="admin-title">แดชบอร์ด</h3>
          <div className="d-flex justify-content-end">
            <small className="text-muted">อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH')}</small>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-5">
        <CardInfo
          title="จำนวนศิษย์เก่าทั้งหมด"
          value={`${alumniCount.toLocaleString()} คน`}
          type="alumni"
          icon={MdPeople}
          onClick={() => navigate("/admin-home/dashboard-alumni")}
        />
        <CardInfo
          title="กิจกรรมที่กำลังดำเนินการ"
          value={`${(stats?.ongoingActivity || 0).toLocaleString()} กิจกรรม`}
          type="activity"
          icon={MdEvent}
          onClick={() => navigate("/admin-home/dashboard-activity")}
        />
        <CardInfo
          title="ยอดบริจาครวมทั้งหมด"
          value={`${formatCurrency(stats?.totalDonations || 0)} บาท`}
          type="donation"
          icon={MdVolunteerActivism}
          onClick={() => navigate("/admin-home/dashboard-donation")}
        />
        <CardInfo
          title="โครงการที่เปิดรับบริจาค"
          value={`${(stats?.ongoingProject || 0).toLocaleString()} โครงการ`}
          type="project"
          icon={MdTrendingUp}
          onClick={() => navigate("/admin-home/dashboard-project")}
        />
      </div>


      {/* Charts Section */}
      <div className="row mb-5">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <h5 className="card-title mb-0 fw-bold">
                จำนวนกิจกรรมในแต่ละเดือน
              </h5>
            </div>
            <div className="card-body p-4">
              {isLoading ? <LoadingSpinner /> : <Bar data={barData} options={barOptions} />}
            </div>
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-header border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <h5 className="card-title mb-0 fw-bold">
                สถิติการบริจาค
              </h5>
            </div>
            <div className="card-body p-4">
              {isLoading ? <LoadingSpinner /> : <Pie data={pieData} options={pieOptions} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;