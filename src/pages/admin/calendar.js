import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);

function AdminCalendar() {
    const [allActivities, setAllActivities] = useState([]);
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:3001/activity/all-activity", {
            withCredentials: true,
        })
        .then((res) => {
            if (res.data.success) {
                const now = new Date();
                const formatted = res.data.data.map((a) => {
                    const start = new Date(`${a.activity_date}T${a.start_time}`);
                    const end = new Date(`${a.activity_date}T${a.end_time}`);
                    let status = "upcoming";
                    if (!a.is_published) {
                        status = "draft";
                    } else if (end < now) {
                        status = "expired";
                    }

                    return {
                        title: a.activity_name,
                        start,
                        end,
                        activity_id: a.activity_id,
                        type: a.activity_type || "ทั่วไป",
                        status: status,
                    };
                });
                setAllActivities(formatted);
                setEvents(formatted);
            }
        })
        .catch((err) => {
            console.error("Error fetching activities:", err);
        });
    }, []);

    // Filter handler
    useEffect(() => {
        if (filter === "all") {
            setEvents(allActivities);
        } else {
            setEvents(allActivities.filter((e) => e.status === filter));
        }
    }, [filter, allActivities]);

    return (
        <div className="container mt-4">
            <div className="p-4 shadow rounded bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="text-primary fw-bold">📅 ปฏิทินกิจกรรม (แอดมิน)</h3>
                    <button className="btn btn-success" onClick={() => navigate("/admin/activity/create")}>
                        ➕ เพิ่มกิจกรรม
                    </button>
                </div>

                <div className="mb-3">
                    <label className="form-label me-2">กรองกิจกรรม:</label>
                    <select className="form-select w-auto d-inline-block"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="upcoming">เผยแพร่ (ยังไม่หมดอายุ)</option>
                        <option value="expired">หมดอายุ</option>
                        <option value="draft">ฉบับร่าง (ยังไม่เผยแพร่)</option>
                    </select>
                </div>

                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectEvent={(event) => navigate(`/admin/activity/${event.activity_id}`)}
                    eventPropGetter={(event) => {
                        let backgroundColor;
                        switch (event.status) {
                            case "expired":
                                backgroundColor = "#d6d6d6";
                                break;
                            case "draft":
                                backgroundColor = "#ffc107";
                                break;
                            default:
                                backgroundColor = "#28a745";
                        }
                        return { style: { backgroundColor, color: "#fff", borderRadius: "6px", padding: "2px 6px" } };
                    }}
                    messages={{
                        next: "ถัดไป",
                        previous: "ก่อนหน้า",
                        today: "วันนี้",
                        month: "เดือน",
                        week: "สัปดาห์",
                        day: "วัน",
                        agenda: "กำหนดการ",
                    }}
                />
            </div>
        </div>
    );
}

export default AdminCalendar;
