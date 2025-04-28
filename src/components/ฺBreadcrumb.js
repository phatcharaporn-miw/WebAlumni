import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { breadcrumbMapping } from '../components/breadcrumbMapping';
// css
import '../css/breadcrumb.css';

function Breadcrumb() {
  const location = useLocation();
  const { activityId, newsId, categoryId, webboardId } = useParams(); 
  const [breadcrumb, setBreadcrumb] = useState({}); 

  // ดึงข้อมูล breadcrumb หากมี activityId, newsId หรือ categoryId
  useEffect(() => {
    if (activityId) {
      axios.get(`http://localhost:3001/activity/${activityId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, activity: response.data.breadcrumb })); 
        })
        .catch(error => {
          console.error("Error fetching activity breadcrumb:", error);
        });
    }
    if (newsId) {
      axios.get(`http://localhost:3001/news/news-id/${newsId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, news: response.data.newsTitle })); 
        })
        .catch(error => {
          console.error("Error fetching news breadcrumb:", error);
        });
    }
    if (categoryId) {
      axios.get(`http://localhost:3001/web/webboard/category/${categoryId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, category: response.data.categoryName })); 
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
    if (webboardId) {
      axios.get(`http://localhost:3001/users/webboard/${webboardId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, webboard: response.data.webboardTitle }));
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
  }, [activityId, newsId, categoryId, webboardId]);

  // แยก path ตาม '/'
  // const pathnames = location.pathname.split('/').filter((item) => item);
  const pathnames = location.pathname
  .split('/')
  .filter((item) => item && item !== 'alumni-home'); // ซ่อน alumni-home

   
  // ซ่อน breadcrumb ในหน้า Login และ Register
  const hiddenPaths = ["/login", "/register", "/forgotPassword"];
  if (hiddenPaths.includes(location.pathname)) {
    return null; 
  }

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">หน้าหลัก</Link>
        </li>
        {pathnames.map((value, index) => {
          const path = `/${pathnames.slice(0, index + 1).join('/')}`;
          let translatedText = breadcrumbMapping[path] || value;

          // ตรวจสอบว่า path 
          if (value === activityId?.toString() && breadcrumb.activity) {
            translatedText = breadcrumb.activity;
          } else if (value === newsId?.toString() && breadcrumb.news) {
            translatedText = breadcrumb.news;
          } else if (value === categoryId?.toString() && breadcrumb.category) {
            translatedText = breadcrumb.category;
          } else if (value === webboardId?.toString() && breadcrumb.webboard) {
            translatedText = breadcrumb.webboard;
          }

          return (
            <li className="breadcrumb-item" key={path}>
              {index === pathnames.length - 1 ? (
                <span>{translatedText}</span> // ไม่ต้องลิงก์ใน breadcrumb สุดท้าย
              ) : (
                <Link to={path}>{translatedText}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
