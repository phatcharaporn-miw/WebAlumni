import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { HOSTNAME } from "../config";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardStatic = () => {
    const currentYear = new Date().getFullYear();
    const [baseYear, setBaseYear] = useState(currentYear);
    const [availableYears, setAvailableYears] = useState([]);
    const [activityChart, setActivityChart] = useState({ labels: [], datasets: [] });
    const [summary, setSummary] = useState({ total_donations: 0, total_activities: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAvailableYears();
    }, []);

    const fetchAvailableYears = async () => {
        try {
            const res = await axios.get(`${HOSTNAME}/admin/available-years`);
            // ตรวจสอบให้แน่ใจว่าปีที่เลือกเป็นปีที่มีข้อมูลอยู่
            const years = res.data.length > 0 ? res.data : [currentYear];
            setAvailableYears(years);
            if (!years.includes(baseYear)) {
                setBaseYear(years[0]);
            }
        } catch (err) {
            console.error("Error fetching years:", err);
        }
    };


    useEffect(() => {
        setIsLoading(true);
        const yearsToFetch = [baseYear, baseYear - 1, baseYear - 2];

        Promise.all([
            fetchActivityByYears(yearsToFetch),
            fetchSummaryByYear(baseYear)
        ]).finally(() => setIsLoading(false));
    }, [baseYear]);


    const fetchActivityByYears = async (years) => {
  const monthNamesThai = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  const labels = monthNamesThai;
  const colors = [
    "rgba(13,110,253,0.8)",  // ปีล่าสุด
    "rgba(25,135,84,0.8)",   // ปีก่อน
    "rgba(255,193,7,0.8)",   // สองปีก่อน
  ];
  const datasets = [];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    try {
      const res = await axios.get(`${HOSTNAME}/admin/activity-per-month`, {
        params: { year },
      });

      if (res.data && res.data.length > 0) {
        const data = Array(12).fill(0);
        res.data.forEach(item => {
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
      }

    } catch (err) {
      console.error(`Error fetching activities for year ${year}:`, err);
    }
  }

  // แสดงเฉพาะปีที่มีข้อมูล
  if (datasets.length === 0) {
    setActivityChart({
      labels,
      datasets: [{
        label: "ไม่มีข้อมูลกิจกรรม",
        data: Array(12).fill(0),
        backgroundColor: "rgba(108,117,125,0.4)",
        borderColor: "rgba(108,117,125,0.7)",
        borderWidth: 1,
        borderRadius: 4,
      }],
    });
  } else {
    setActivityChart({ labels, datasets });
  }
};


    const fetchSummaryByYear = async (year) => {
        try {
            const res = await axios.get(`${HOSTNAME}/admin/summary-totals`, {
                params: { year },
            });
            setSummary(res.data);
        } catch (err) {
            console.error("Error fetching summary:", err);
            setSummary({ total_donations: 0, total_activities: 0 }); // กำหนดค่าเริ่มต้นถ้าผิดพลาด
        }
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom",
                labels: { usePointStyle: true, padding: 20 },
            },
        },
        scales: {
            y: { beginAtZero: true, title: { display: true } },
            x: {
                stacked: false,
                ticks: { autoSkip: false },
            }
        },
    };

    return (
        <div className="container py-5">
                <div className="text-center mb-5">
                    <div className="d-inline-block position-relative">
                        <h3 id="head-text" className="text-center mb-3 position-relative">
                            แดชบอร์ดเปรียบเทียบข้อมูล
                            <div className="title-underline position-absolute start-50 translate-middle-x mt-2"
                                style={{
                                    width: '120px',
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #007bff, #6610f2)',
                                    borderRadius: '2px',
                                    boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
                                }}>
                            </div>
                        </h3>

                        {/* Decorative elements */}
                        <div className="position-absolute top-0 start-0 translate-middle">
                            <div className="bg-primary opacity-25 rounded-circle"
                                style={{ width: '20px', height: '20px' }}>
                            </div>
                        </div>
                        <div className="position-absolute top-0 end-0 translate-middle">
                            <div className="bg-success opacity-25 rounded-circle"
                                style={{ width: '15px', height: '15px' }}>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dropdown เลือกปี*/}
                <div className="d-flex justify-content-end mb-4">
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

            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="fw-bold text-primary">ยอดบริจาครวม (ปี {baseYear + 543})</h5>
                            <h2 className="fw-bold text-success mt-2">
                                {(summary.total_donations || 0).toLocaleString()} บาท
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-3">
                    <div className="card shadow border-0 h-100">
                        <div className="card-body text-center">
                            <h5 className="fw-bold text-primary">จำนวนกิจกรรมทั้งหมด (ปี {baseYear + 543})</h5>
                            <h2 className="fw-bold text-info mt-2">
                                {(summary.total_activities || 0).toLocaleString()} กิจกรรม
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* กราฟกิจกรรมเปรียบเทียบ 3 ปี */}
            <div className="card shadow border-0 mb-4">
                <div className="card-header bg-primary text-white fw-bold">
                    กราฟเปรียบเทียบจำนวนกิจกรรมรายเดือน 3 ปี
                </div>
                <div className="card-body">
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <Bar data={activityChart} options={barOptions} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardStatic;