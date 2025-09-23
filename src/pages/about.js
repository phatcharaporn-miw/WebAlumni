// import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "../css/about.css"
import {useEffect} from "react";
import { useAuth } from '../context/AuthContext';
// import axios from "axios";
import { IoMdPin, IoMdCall } from "react-icons/io";
import { MdEmail } from "react-icons/md";
// import { Phone, Mail, MapPin, Users, Award, BookOpen, Heart, Star } from 'lucide-react';

function About() {
  const people = [
    {
      name: "นายวิมล นามอาษา",
      position: "นายกสมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์",
      img: "/image/นายกสมาคมศิษย์เก่าวิทยาลัยคอมพิวเตอร์.jpg"
    },
    {
      name: "นางแก้วกมล วงศ์ตระกูล",
      position: "อุปนายกสมาคมคนที่ 1",
      img: "/image/อุปนายกสมาคมคนที่ 1.jpg"
    },
    {
      name: "นายนะเรศ เงาะแก้ว",
      position: "อุปนายกสมาคมคนที่ 2",
      img: "/image/อุปนายกสมาคมคนที่ 2.jpg"
    },
    {
      name: "นางสาววิจิตรา ขจร",
      position: "เลขานุการ",
      img: "/image/เลขานุการ.png"
    },
    {
      name: "นายเกียรติศักดิ์ ทวีฤทธิ์",
      position: "เหรัญญิก",
      img: "/image/เหรัญญิก.jpg"
    },
    {
      name: "นายกานต์ เสารยะวิเศษ",
      position: "นายทะเบียน",
      img: "/image/นายทะเบียน.jpg"
    },
    {
      name: "นายมรกต ดาวแก้ว",
      position: "ปฏิคม",
      img: "/image/ปฎิคม.jpg"
    },
    {
      name: "นายสุวิทวัส แก้ววิเชียร",
      position: "สื่อสารองค์กร",
      img: "/image/สื่อสารองค์กร.jpg"
    }
  ];

  // Scroll to top on mount
      useEffect(() => {
          window.scrollTo(0, 0);
      }, []);
  
  return (
    <section className="container">
      <div className="about-page">
        <div className="home-about">
          <div className="container">
            {/* Enhanced Header */}
            <div className="text-center mb-5">
              <div className="d-inline-block position-relative">
                <h3 id="head-text" className="text-center mb-3 position-relative">
                  เกี่ยวกับสมาคม
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

              <p className="text-muted mt-3" style={{ fontSize: '1.1rem', fontStyle: 'italic' }}>
                สมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
              </p>
            </div>

            {/* Enhanced Main Card */}
            <div className="card shadow-lg border-0 overflow-hidden position-relative"
              style={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(0,123,255,0.1)'
              }}>

              {/* Decorative corner elements */}
              <div className="position-absolute top-0 start-0 bg-primary opacity-75"
                style={{ width: '60px', height: '60px', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
              </div>
              <div className="position-absolute top-0 end-0 bg-success opacity-75"
                style={{ width: '40px', height: '40px', clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}>
              </div>

              {/* Enhanced Image Section */}
              <div className="position-relative">
                <img
                  src="/image/about_cp.jpg"
                  className="img-fluid w-100"
                  alt="ภาพสมาคม"
                  style={{
                    maxHeight: "450px",
                    objectFit: "cover",
                    filter: 'brightness(0.95) contrast(1.05)'
                  }}
                />

                {/* Image overlay with gradient */}
                <div className="position-absolute bottom-0 start-0 end-0 p-4"
                  style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white'
                  }}>
                  <div className="text-center">
                    <h5 className="mb-0 fw-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      🏛️ วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
                    </h5>
                  </div>
                </div>
              </div>

              <div className="card-body p-5">
                {/* Enhanced Title */}
                <div className="text-center mb-4">
                  <h4 className="card-title fw-bold mb-3 position-relative d-inline-block"
                    style={{
                      color: '#2c3e50',
                      fontSize: '1.8rem',
                      lineHeight: '1.3'
                    }}>
                    สมาคมศิษย์เก่าวิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยขอนแก่น
                    <div className="position-absolute bottom-0 start-50 translate-middle-x bg-primary"
                      style={{ width: '60px', height: '3px', borderRadius: '2px' }}>
                    </div>
                  </h4>
                </div>

                {/* Enhanced Description */}
                <div className="mb-5">
                  <p className="card-text text-muted text-center lh-lg px-3"
                    style={{
                      fontSize: '1.1rem',
                      textAlign: 'justify',
                      textIndent: '2rem'
                    }}>
                    สมาคมศิษย์เก่ามหาวิทยาลัยขอนแก่นก่อตั้งขึ้นเพื่อเสริมสร้างเครือข่ายและความร่วมมือระหว่างศิษย์เก่า
                    ศิษย์ปัจจุบัน และคณาจารย์ รวมถึงสนับสนุนการพัฒนาด้านเทคโนโลยีสารสนเทศ
                    ส่งเสริมโอกาสทางอาชีพ และให้การสนับสนุนแก่ศิษย์ปัจจุบันในการศึกษาวิจัยและนวัตกรรม
                  </p>
                </div>

                {/* Enhanced Vision Section */}
                <div className="row mb-5">
                  <div className="col-12">
                    <div className="card border-primary border-2 bg-light-subtle h-100">
                      <div className="card-header bg-primary text-white text-center py-3">
                        <h5 className="mb-0 fw-bold">
                          <i className="fas fa-eye me-2"></i>
                          วิสัยทัศน์
                        </h5>
                      </div>
                      <div className="card-body text-center py-4">
                        <blockquote className="blockquote mb-0">
                          <p className="fw-bold text-primary" style={{ fontSize: '1.3rem', fontStyle: 'italic' }}>
                            "เชื่อมโยงศิษย์เก่า ก้าวทันเทคโนโลยี สนับสนุนสังคมดิจิทัล"
                          </p>
                        </blockquote>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Mission Section */}
                <div className="mb-5">
                  <div className="text-center mb-4">
                    <h5 className="fw-bold text-dark position-relative d-inline-block"
                      style={{ fontSize: '1.5rem' }}>
                      <i className="fas fa-bullseye me-2"></i>
                      พันธกิจของสมาคม
                      <div className="position-absolute bottom-0 start-50 translate-middle-x bg-success"
                        style={{ width: '40px', height: '2px', borderRadius: '1px' }}>
                      </div>
                    </h5>
                  </div>

                  <div className="row g-3">
                    {[
                      {
                        icon: "🤝",
                        title: "เครือข่ายศิษย์เก่า",
                        description: "สร้างเครือข่ายศิษย์เก่าเพื่อส่งเสริมความร่วมมือด้านอาชีพ"
                      },
                      {
                        icon: "📚",
                        title: "วิชาการและวิจัย",
                        description: "สนับสนุนกิจกรรมวิชาการและการวิจัยทางคอมพิวเตอร์"
                      },
                      {
                        icon: "💼",
                        title: "โอกาสทางอาชีพ",
                        description: "ส่งเสริมโอกาสด้านอาชีพและการประกอบธุรกิจของศิษย์เก่า"
                      },
                      {
                        icon: "🎓",
                        title: "ทุนการศึกษา",
                        description: "ให้ทุนสนับสนุนการศึกษาและพัฒนาศิษย์ปัจจุบัน"
                      },
                      {
                        icon: "🏫",
                        title: "สานสัมพันธ์",
                        description: "จัดกิจกรรมสานสัมพันธ์ศิษย์เก่ากับคณะและมหาวิทยาลัย"
                      }
                    ].map((mission, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card h-100 border-0 shadow-sm position-relative overflow-hidden"
                          style={{
                            borderRadius: '15px',
                          }}>

                          {/* Card accent */}
                          <div className="position-absolute top-0 start-0 end-0 bg-primary"
                            style={{ height: '4px', borderRadius: '15px 15px 0 0' }}>
                          </div>

                          <div className="card-body p-4 text-center">
                            <div className="mb-3">
                              <span style={{ fontSize: '2.5rem' }}>{mission.icon}</span>
                            </div>
                            <h6 className="card-title fw-bold text-dark mb-2">
                              {mission.title}
                            </h6>
                            <p className="card-text text-muted small lh-base">
                              {mission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-5">
                  <div className="d-inline-block position-relative">
                    {/* button */}
                    <div className="position-absolute top-0 start-0 translate-middle">
                      <div className="bg-warning opacity-50 rounded-circle"
                        style={{ width: '12px', height: '12px', animation: 'pulse 2s infinite' }}>
                      </div>
                    </div>
                    <div className="position-absolute bottom-0 end-0 translate-middle">
                      <div className="bg-success opacity-50 rounded-circle"
                        style={{ width: '8px', height: '8px', animation: 'pulse 2s infinite 0.5s' }}>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนของบุคลากรที่เกี่ยวข้อง */}
        <div className="personnel-section py-5"
          style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background*/}
          <div className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: 'radial-gradient(circle at 20% 20%, rgba(13,110,253,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13,110,253,0.08) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}
          ></div>

          <div className="container position-relative">
            <h3 className="about-title text-center mt-5 mb-5 position-relative">
              <span className="text-dark fw-bold"
                style={{
                  fontSize: '2.5rem',
                  letterSpacing: '1px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                บุคลากรที่เกี่ยวข้อง
              </span>
              <div className="position-absolute start-50 translate-middle-x d-flex align-items-center justify-content-center"
                style={{
                  bottom: '-20px',
                  width: '100px',
                  height: '6px'
                }}
              >
                <div className="bg-primary rounded-pill"
                  style={{
                    width: '60px',
                    height: '4px',
                    boxShadow: '0 2px 8px rgba(13,110,253,0.4)'
                  }}
                ></div>
                <div className="bg-primary rounded-circle mx-2"
                  style={{
                    width: '8px',
                    height: '8px',
                    animation: 'pulse 2s infinite'
                  }}
                ></div>
                <div className="bg-primary rounded-pill"
                  style={{
                    width: '30px',
                    height: '4px',
                    opacity: '0.6'
                  }}
                ></div>
              </div>
            </h3>

            <div className="row justify-content-center g-4 mt-5">         
              {people.map((person, idx) => {
                const isPresident = person.position?.includes('นายก') || person.position?.includes('ประธาน');
                const isVicePresident = person.position?.includes('อุปนายก') || person.position?.includes('รองประธาน');
                const isExecutive = isPresident || isVicePresident;

                return (
                  <div
                    className={`col-12 col-sm-6 col-md-4 ${isExecutive ? 'col-lg-4' : 'col-lg-3'} d-flex`}
                    key={idx}
                  >
                    <div
                      className={`card shadow-lg border-0 rounded-4 w-100 h-100 person-card position-relative overflow-hidden ${isExecutive ? 'executive-card' : ''}`}
                      style={{
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        background: isExecutive
                          ? "linear-gradient(135deg, #fff5f5 0%, #ffe6e6 50%, #fff0f0 100%)"
                          : "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
                        backdropFilter: 'blur(10px)',
                        border: isExecutive
                          ? '2px solid rgba(220,53,69,0.3)'
                          : '1px solid rgba(255,255,255,0.2)',
                        animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                        transform: isExecutive ? 'scale(1.05)' : 'scale(1)',
                        zIndex: isExecutive ? 10 : 1
                      }}
                      onMouseEnter={e => {
                        const scale = isExecutive ? 1.08 : 1.02;
                        e.currentTarget.style.transform = `translateY(-12px) scale(${scale})`;
                        e.currentTarget.style.boxShadow = isExecutive
                          ? "0 25px 50px rgba(220,53,69,0.25)"
                          : "0 20px 40px rgba(13,110,253,0.15)";
                        e.currentTarget.style.background = isExecutive
                          ? "linear-gradient(135deg, #fff0f0 0%, #ffe0e0 50%, #fff5f5 100%)"
                          : "linear-gradient(135deg, #fff 0%, #f0f8ff 100%)";
                      }}
                      onMouseLeave={e => {
                        const scale = isExecutive ? 1.05 : 1;
                        e.currentTarget.style.transform = `translateY(0) scale(${scale})`;
                        e.currentTarget.style.boxShadow = isExecutive
                          ? "0 15px 35px rgba(220,53,69,0.15)"
                          : "0 8px 25px rgba(0,0,0,0.1)";
                        e.currentTarget.style.background = isExecutive
                          ? "linear-gradient(135deg, #fff5f5 0%, #ffe6e6 50%, #fff0f0 100%)"
                          : "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)";
                      }}
                    >
                      {/* Decorative corner */}
                      <div className="position-absolute top-0 start-0"
                        style={{
                          width: isExecutive ? '60px' : '40px',
                          height: isExecutive ? '60px' : '40px',
                          background: isExecutive
                            ? 'linear-gradient(45deg, #dc3545, #fd7e14)'
                            : 'linear-gradient(45deg, #007bff, #00c6ff)',
                          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                          opacity: '0.8'
                        }}
                      ></div>

                      <div className="position-relative">
                        <div className="image-container position-relative overflow-hidden"
                          style={{
                            borderRadius: '1rem 1rem 0 0'
                          }}
                        >
                          <img
                            src={person.img}
                            className="card-img-top"
                            alt={person.name}
                            style={{
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "1rem 1rem 0 0",
                              transition: "transform 0.4s ease"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = "scale(1.1)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          />
                          {/* Overlay gradient */}
                          <div className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                              background: 'linear-gradient(45deg, rgba(13,110,253,0.1) 0%, transparent 50%)',
                              pointerEvents: 'none'
                            }}
                          ></div>
                        </div>

                        <div className="position-absolute top-0 end-0 m-3">
                          <span className={`badge text-white px-3 py-2 rounded-pill shadow-sm position-relative ${isExecutive ? 'executive-badge' : ''}`}
                            style={{
                              background: isExecutive
                                ? 'linear-gradient(45deg, #dc3545, #fd7e14)'
                                : 'linear-gradient(45deg, #007bff, #00c6ff)',
                              fontSize: isExecutive ? '0.9rem' : '0.8rem',
                              fontWeight: '600',
                              backdropFilter: 'blur(10px)',
                              boxShadow: isExecutive
                                ? '0 4px 15px rgba(220,53,69,0.4)'
                                : '0 2px 8px rgba(13,110,253,0.3)'
                            }}
                          >
                            <span className="position-relative z-1">
                              {isPresident ? 'นายก' : isVicePresident ? 'รองนายก' : 'บุคลากร'}
                            </span>
                            <div className="position-absolute top-0 start-0 w-100 h-100 rounded-pill"
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                // animation: isExecutive ? 'shimmer 1.5s infinite' : 'shimmer 2s infinite'
                              }}
                            ></div>
                          </span>
                        </div>
                      </div>

                      <div className="card-body text-center d-flex flex-column justify-content-between p-4">
                        <div>
                          <h5 className={`card-title fw-bold mb-2 position-relative ${isExecutive ? 'executive-title' : ''}`}
                            style={{
                              fontSize: isExecutive ? '1.4rem' : '1.2rem',
                              letterSpacing: '0.5px',
                              color: isExecutive ? '#dc3545' : '#212529'
                            }}
                          >
                            {/* {isExecutive && (
                              <span className="me-2" style={{ fontSize: '1.2rem' }}>
                                {isPresident ? '👑' : '🎖️'}
                              </span>
                            )} */}
                            {person.name}
                            <div className="position-absolute start-50 translate-middle-x mt-1"
                              style={{
                                width: isExecutive ? '50px' : '30px',
                                height: isExecutive ? '3px' : '2px',
                                background: isExecutive
                                  ? 'linear-gradient(45deg, #dc3545, #fd7e14)'
                                  : 'linear-gradient(45deg, #007bff, #00c6ff)',
                                borderRadius: '2px',
                                boxShadow: isExecutive
                                  ? '0 2px 8px rgba(220,53,69,0.4)'
                                  : '0 1px 4px rgba(13,110,253,0.3)'
                              }}
                            ></div>
                          </h5>
                          <p className={`card-text mb-0 mt-3 ${isExecutive ? 'executive-position' : 'text-muted'}`}
                            style={{
                              fontSize: isExecutive ? '1.1rem' : '0.95rem',
                              lineHeight: '1.4',
                              fontWeight: isExecutive ? '600' : '400',
                              color: isExecutive ? '#dc3545' : '#6c757d'
                            }}
                          >
                            {person.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ช่องทางการติดต่อ */}
          <div className="contact-section py-5" style={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>

            {/* Animated background shapes */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.08) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}></div>

            <div className="container position-relative">
              <h3 className="about-title text-center mb-5 text-white position-relative">
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  ช่องทางการติดต่อ
                </span>
                <div className="position-absolute start-50 translate-middle-x d-flex align-items-center justify-content-center" style={{
                  bottom: '-20px',
                  width: '100px',
                  height: '6px'
                }}>
                  <div className="bg-white rounded-pill" style={{
                    width: '60px',
                    height: '4px',
                    boxShadow: '0 2px 8px rgba(255,255,255,0.4)'
                  }}></div>
                  <div className="bg-white rounded-circle mx-2" style={{
                    width: '8px',
                    height: '8px',
                    animation: 'pulse 2s infinite'
                  }}></div>
                  <div className="bg-white rounded-pill" style={{
                    width: '30px',
                    height: '4px',
                    opacity: '0.6'
                  }}></div>
                </div>
              </h3>

              <div className="row mb-5 mt-5">
                <div className="col-lg-6 mb-4">
                  <div className="contact-info-wrapper" style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                  }}>
                    <div className="contact-item phone mb-4" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '15px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div className="contact-icon-wrapper me-3" style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(40,167,69,0.3)'
                      }}>
                        <IoMdCall style={{ fontSize: '1.5rem', color: 'white' }} />
                      </div>
                      <div className="text-white">
                        <p className="mb-1 fw-bold" style={{ fontSize: '1.1rem' }}>เบอร์โทร</p>
                        <p className="mb-0" style={{ fontSize: '1rem', opacity: '0.9' }}>044-870000</p>
                      </div>
                    </div>

                    <div className="contact-item email mb-4" style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '15px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div className="contact-icon-wrapper me-3" style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #dc3545, #fd7e14)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(220,53,69,0.3)'
                      }}>
                        <MdEmail style={{ fontSize: '1.5rem', color: 'white' }} />
                      </div>
                      <div className="text-white">
                        <p className="mb-1 fw-bold" style={{ fontSize: '1.1rem' }}>อีเมล</p>
                        <p className="mb-0" style={{ fontSize: '1rem', opacity: '0.9' }}>alumnicomputing@gmail.com</p>
                      </div>
                    </div>

                    <div className="contact-item address" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '15px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div className="contact-icon-wrapper me-3" style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #007bff, #00c6ff)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                        flexShrink: 0
                      }}>
                        <IoMdPin style={{ fontSize: '1.5rem', color: 'white' }} />
                      </div>
                      <div className="text-white">
                        <p className="mb-1 fw-bold" style={{ fontSize: '1.1rem' }}>ที่อยู่</p>
                        <p className="mb-1" style={{ fontSize: '1rem', opacity: '0.9', lineHeight: '1.4' }}>วิทยาลัยการคอมพิวเตอร์</p>
                        <p className="mb-1" style={{ fontSize: '1rem', opacity: '0.9', lineHeight: '1.4' }}>123 ถ.มิตรภาพ ต.ในเมือง</p>
                        <p className="mb-0" style={{ fontSize: '1rem', opacity: '0.9', lineHeight: '1.4' }}>อ.เมือง จ.ขอนแก่น 40002</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="map-container" style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    border: '3px solid rgba(255,255,255,0.2)',
                    position: 'relative'
                  }}>
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}>
                      <div className="text-white text-center" style={{
                        background: 'rgba(0,0,0,0.7)',
                        padding: '1rem',
                        borderRadius: '10px',
                        backdropFilter: 'blur(20px)'
                      }}>
                        <h5 className="mb-2">📍 ตำแหน่งสถานที่</h5>
                        <p className="mb-0 small">คลิกเพื่อดูแผนที่</p>
                      </div>
                    </div>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30607.44894393471!2d102.81615358599814!3d16.47902518541837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31228b8217d082cb%3A0xb58fd61bc8e85e11!2sCollege%20of%20Computing%20Khon%20Kaen%20University!5e0!3m2!1sen!2sth!4v1736759203949!5m2!1sen!2sth"
                      width="100%"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      onLoad={(e) => {
                        e.target.parentElement.querySelector('.position-absolute').style.opacity = '0';
                      }}
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


export default About;