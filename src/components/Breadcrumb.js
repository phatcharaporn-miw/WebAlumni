import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { breadcrumbMapping } from '../components/breadcrumbMapping';
import {HOSTNAME} from '../config.js';
// css
import '../css/breadcrumb.css';

function Breadcrumb() {
  const location = useLocation();
  const { activityId, newsId, categoryId, webboardId, projectId, productId, userId } = useParams(); 
  const [breadcrumb, setBreadcrumb] = useState({}); 

  // ดึงข้อมูล breadcrumb หากมี activityId, newsId หรือ categoryId
  useEffect(() => {
    if (activityId) {
      axios.get(HOSTNAME +`/activity/${activityId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, activity: response.data.breadcrumb })); 
        })
        .catch(error => {
          console.error("Error fetching activity breadcrumb:", error);
        });
    }
    if (newsId) {
      axios.get(HOSTNAME +`/news/news-id/${newsId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, news: response.data.newsTitle })); 
        })
        .catch(error => {
          console.error("Error fetching news breadcrumb:", error);
        });
    }
    if (categoryId) {
      axios.get(HOSTNAME +`/web/webboard/category/${categoryId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, category: response.data.categoryName })); 
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
    if (webboardId) {
      axios.get(HOSTNAME +`/users/webboard/${webboardId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, webboard: response.data.webboardTitle }));
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
    if (projectId) {
      axios.get(HOSTNAME +`/donate/donatedetail/${projectId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, DonateDetail: response.data.project_name }));
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
    if (productId) {
      axios.get(HOSTNAME +`/souvenir/souvenirDetail/${productId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, souvenirDetail: response.data.product_name }));
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
    if (userId) {
      axios.get(HOSTNAME +`/alumni/${userId}`)
        .then(response => {
          setBreadcrumb(prev => ({ ...prev, alumniProfile: response.data.fullName }));
        })
        .catch(error => {
          console.error("Error fetching category breadcrumb:", error);
        });
    }
  }, [activityId, newsId, categoryId, webboardId, projectId, productId, userId]);

  // แยก path ตาม '/'
  const pathnames = location.pathname
  .split('/')
  .filter((item) =>
    item &&
    item !== 'alumni-home' &&
    item !== 'president-home' &&
    item !== 'student-home'
  );

  // ซ่อน breadcrumb 
  const hiddenPaths = ["/login", "/register", "/forgotPassword", "/change-password"];
  if (hiddenPaths.includes(location.pathname)) {
    return null; 
  }

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
      <li
        className="breadcrumb-item"
        style={{
          textDecoration:
            location.pathname === "/" ? "underline" : "none",
          textDecorationColor:
            location.pathname === "/" ? "#0F75BC" : "inherit",
          fontWeight: location.pathname === "/" ? "600" : "normal",
        }}
      >
        <Link
          to="/"
        >
          หน้าหลัก
        </Link>
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
          }else if (value === projectId?.toString() && breadcrumb.DonateDetail) {
            translatedText = breadcrumb.DonateDetail;
          }else if (value === productId?.toString() && breadcrumb.souvenirDetail) {
            translatedText = breadcrumb.souvenirDetail;
          }else if (value === userId?.toString() && breadcrumb.alumniProfile) {
            translatedText = breadcrumb.alumniProfile;
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
