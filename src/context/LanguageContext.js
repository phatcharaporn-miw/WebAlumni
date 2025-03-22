import React, { createContext, useContext, useState } from 'react';

// สร้าง Context สำหรับภาษา
const LanguageContext = createContext();

// กำหนดค่าเริ่มต้น 
const defaultLanguage = 'th'; 

// ฟังก์ชันที่ใช้จัดการภาษา
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(defaultLanguage);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// hook ที่ใช้ในการดึงข้อมูลจาก Context
export const useLanguage = () => {
  return useContext(LanguageContext);
};
