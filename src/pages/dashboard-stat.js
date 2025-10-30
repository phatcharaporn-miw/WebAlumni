import React, { useEffect, useState } from "react";
import axios from "axios";
import { HOSTNAME } from "../config";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, Gift, Users, Activity } from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const DashboardStatic = () => {
  const currentYear = new Date().getFullYear();
  const [baseYear, setBaseYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([]);
  const [activityChart, setActivityChart] = useState({ labels: [], datasets: [] });
  const [donationCategory, setDonationCategory] = useState({ labels: [], datasets: [] });
  const [summary, setSummary] = useState({
    total_donations: 0,
    total_activities: 0,
    total_participants: 0,
  });
  const [topActivities, setTopActivities] = useState([]);
  const [festivalFilter, setFestivalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // โหลดปีที่มีข้อมูล
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  const fetchAvailableYears = async () => {
    try {
      const res = await axios.get(`${HOSTNAME}/admin/available-years`);
      const years = res.data.length > 0 ? res.data : [currentYear];
      setAvailableYears(years);
      if (!years.includes(baseYear)) setBaseYear(years[0]);
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  // โหลดข้อมูลทุกครั้งที่เปลี่ยนปี
  useEffect(() => {
    setIsLoading(true);
    const yearsToFetch = [baseYear, baseYear - 1, baseYear - 2];

    Promise.all([
      fetchActivityByYears(yearsToFetch),
      fetchSummaryByYear(baseYear),
      fetchDonationCategory(baseYear),
      fetchTopActivities(baseYear),
    ]).finally(() => setIsLoading(false));
  }, [baseYear]);

  // 🔹 ฟังก์ชันดึงข้อมูลกิจกรรมรายเดือน
  const fetchActivityByYears = async (years) => {
    const monthNamesThai = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const labels = monthNamesThai;
    const colors = [
      "rgba(13,110,253,0.8)",  // ล่าสุด
      "rgba(25,135,84,0.8)",   // ปีก่อน
      "rgba(255,193,7,0.8)",   // 2 ปีก่อน
    ];
    const datasets = [];

    for (let i = 0; i < years.length; i++) {
      const year = years[i];
      try {
        const res = await axios.get(`${HOSTNAME}/admin/activity-per-month`, { params: { year } });
        const data = Array(12).fill(0);
        res.data.forEach((item) => {
          data[item.month_number - 1] = item.total_activities;
        });

        datasets.push({
          label: `${year + 543}`,
          data,
          backgroundColor: colors[i],
          borderColor: colors[i],
          borderWidth: 1,
          borderRadius: 4,
        });
      } catch (err) {
        console.error(`Error fetching activities for ${year}:`, err);
      }
    }

    setActivityChart({ labels, datasets });
  };

  // 🔹 สรุปยอดรวม
  const fetchSummaryByYear = async (year) => {
    try {
      const res = await axios.get(`${HOSTNAME}/admin/summary-totals`, { params: { year } });
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setSummary({ total_donations: 0, total_activities: 0, total_participants: 0 });
    }
  };

  // 🔹 ดึงข้อมูลยอดบริจาคตามหมวดหมู่ (Pie)
  const fetchDonationCategory = async (year) => {
    try {
      const res = await axios.get(`${HOSTNAME}/admin/donation-category`, { params: { year } });
      const labels = res.data.map((d) => d.category);
      const data = res.data.map((d) => d.amount);
      setDonationCategory({
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "rgba(13,110,253,0.8)",
              "rgba(220,53,69,0.8)",
              "rgba(40,167,69,0.8)",
              "rgba(255,193,7,0.8)",
            ],
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching donation category:", err);
    }
  };

  // 🔹 กิจกรรมยอดนิยม
  const fetchTopActivities = async (year) => {
    try {
      const res = await axios.get(`${HOSTNAME}/admin/top-activities`, { params: { year } });
      setTopActivities(res.data);
    } catch (err) {
      console.error("Error fetching top activities:", err);
    }
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true } },
    },
    scales: { y: { beginAtZero: true }, x: { ticks: { autoSkip: false } } },
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h3 className="fw-bold position-relative d-inline-block">
          แดชบอร์ดภาพรวมกิจกรรมและการบริจาค
          <div
            className="position-absolute start-50 translate-middle-x mt-2"
            style={{
              width: "120px",
              height: "4px",
              background: "linear-gradient(90deg, #007bff, #6610f2)",
              borderRadius: "2px",
            }}
          ></div>
        </h3>
      </div>

      {/* 🔸 Filter & Search */}
      <div className="d-flex flex-wrap gap-2 justify-content-end mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="ค้นหากิจกรรม..."
          style={{ maxWidth: 250 }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select w-auto"
          value={festivalFilter}
          onChange={(e) => setFestivalFilter(e.target.value)}
        >
          <option value="">เลือกเทศกาล</option>
          <option value="newyear">ปีใหม่</option>
          <option value="teacher">วันไหว้ครู</option>
          <option value="sport">กีฬาสี</option>
        </select>
        <select
          className="form-select w-auto"
          value={baseYear}
          onChange={(e) => setBaseYear(parseInt(e.target.value))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y + 543}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Summary Cards */}
      <div className="row g-3 mb-4">
        {[
          {
  title: "ยอดบริจาครวม",
  value: `${(summary?.total_donations || 0).toLocaleString()} บาท`,
  icon: <Gift size={32} color="#28a745" />,
},
{
  title: "กิจกรรมทั้งหมด",
  value: `${(summary?.total_activities || 0).toLocaleString()} รายการ`,
  icon: <Activity size={32} color="#0d6efd" />,
},
{
  title: "ผู้เข้าร่วมทั้งหมด",
  value: `${(summary?.total_participants || 0).toLocaleString()} คน`,
  icon: <Users size={32} color="#6610f2" />,
},

        ].map((item, i) => (
          <div key={i} className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <div className="mb-2">{item.icon}</div>
                <h6 className="fw-bold text-secondary">{item.title}</h6>
                <h4 className="fw-bold mt-2">{item.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔹 Charts */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3">
          <div className="card shadow border-0 h-100">
            <div className="card-header bg-primary text-white fw-bold">
              กราฟจำนวนกิจกรรมรายเดือน (3 ปี)
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <Bar data={activityChart} options={barOptions} />
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow border-0 h-100">
            <div className="card-header bg-success text-white fw-bold">
              สัดส่วนหมวดหมู่การบริจาค
            </div>
            <div className="card-body">
              {donationCategory.labels.length > 0 ? (
                <Pie data={donationCategory} />
              ) : (
                <p className="text-center text-muted py-5">ไม่มีข้อมูล</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 กิจกรรมยอดนิยม */}
      <div className="card shadow border-0 mb-4">
        <div className="card-header bg-info text-white fw-bold">
          🔥 กิจกรรมยอดนิยม
        </div>
        <div className="card-body">
          {topActivities.length > 0 ? (
            topActivities
              .filter((a) =>
                a.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((a) => (
                <div
                  key={a.id}
                  className="d-flex justify-content-between border-bottom py-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/activities/${a.id}`)}
                >
                  <span>{a.name}</span>
                  <span className="text-muted">{a.participants} คน</span>
                </div>
              ))
          ) : (
            <p className="text-center text-muted py-4">ไม่มีข้อมูลกิจกรรมยอดนิยม</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStatic;
