import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../css/calendar.css"; // เพิ่ม custom style ถ้าต้องการ

const localizer = momentLocalizer(moment);

function Calendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/activity/all-activity", {
            withCredentials: true,
        })
        .then((response) => {
            if (response.data.success) {
                const formattedEvents = response.data.data.map((activity) => ({
                    title: activity.activity_name,
                    start: new Date(`${activity.activity_date}T${activity.start_time}`),
                    end: new Date(`${activity.activity_date}T${activity.end_time}`),
                }));
                setEvents(formattedEvents);
            }
        })
        .catch((error) => {
            console.error("Error fetching activities:", error);
        });
    }, []);

    return (
        <div className="container mt-4">
            <div className="p-4 shadow rounded bg-white">
                <h3 className="mb-4 text-center text-primary fw-bold">📅 ปฏิทินกิจกรรม</h3>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
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

export default Calendar;
