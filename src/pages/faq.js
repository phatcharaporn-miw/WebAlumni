import React, { useState } from "react";
import "../css/faq.css";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqCategories = [
        {
            title: "ข้อมูลศิษย์เก่าและกิจกรรม",
            faqs: [
                {
                    question: "ลืมรหัสผ่าน ต้องทำอย่างไร?",
                    answer: `1. คลิกที่ปุ่ม "ลืมรหัสผ่าน?" บนหน้าเข้าสู่ระบบ <br />
                            2. กรอกอีเมลที่คุณใช้ลงทะเบียน <br />
                            3. ตรวจสอบอีเมลของคุณเพื่อหาลิงก์รีเซ็ตรหัสผ่านจากเรา`
                },
                {
                    question: "สามารถเปลี่ยนอีเมลได้หรือไม่?",
                    answer: `ไม่สามารถเปลี่ยนอีเมลที่ลงทะเบียนได้ กรุณาติดต่อฝ่ายสนับสนุน`
                },
                {
                    question: "ต้องการลงทะเบียนเข้าร่วมกิจกรรมทำอย่างไร?",
                    answer: `คุณสามารถเลือกกิจกรรมที่ต้องการเข้าร่วม โดยจะลงทะเบียนผ่านแบบฟอร์มหรือสแกนคิวอาร์โค้ดของกิจกรรมที่คุณสนใจ`
                }
            ]
        },
        {
            title: "การบริจาค",
            faqs: [
                {
                    question: "ฉันสามารถบริจาคเงินหรือของที่ระลึกได้ที่ไหน?",
                    answer: `คุณสามารถทำการบริจาคเงินหรือของที่ระลึกได้ผ่านเมนู "การบริจาค" ที่อยู่บนหน้าแรก ระบบจะมีขั้นตอนการกรอกข้อมูลและรายละเอียดที่คุณต้องการ`
                },
                {
                    question: "ฉันสามารถติดตามการบริจาคของฉันได้ที่ไหน?",
                    answer: `คุณสามารถติดตามประวัติการบริจาคได้ในส่วน "ประวัติการบริจาค" ที่อยู่ในหน้าโปรไฟล์ของคุณ`
                }
            ]
        },
        {
            title: "การใช้งานเว็บบอร์ด",
            faqs: [
                {
                    question: "ฉันจะเข้าร่วมเว็บบอร์ดยังไง?",
                    answer: `คุณสามารถคลิกที่เมนู "เว็บบอร์ด" บนหน้าแรก แล้วเลือกกระทู้ที่สนใจเพื่อเข้าร่วมได้ทันที`
                },
                {
                    question: "ฉันสามารถสร้างกระทู้ใหม่ได้หรือไม่?",
                    answer: `ใช่ค่ะ คุณสามารถสร้างกระทู้ใหม่ได้โดยการคลิกที่ปุ่ม "สร้างกระทู้ใหม่" หลังจากที่คุณเข้าสู่หน้าเว็บบอร์ดแล้ว`
                }
            ]
        },
        {
            title: "การจัดการบัญชี",
            faqs: [
                {
                    question: "ฉันจะเปลี่ยนรหัสผ่านบัญชีได้อย่างไร?",
                    answer: `คุณสามารถเปลี่ยนรหัสผ่านได้โดยไปที่หน้า "โปรไฟล์" แล้วเลือก "เปลี่ยนรหัสผ่าน"`
                },
                {
                    question: "ฉันลืมรหัสผ่าน จะทำอย่างไร?",
                    answer: `หากคุณลืมรหัสผ่าน สามารถคลิกที่ลิงก์ "ลืมรหัสผ่าน" บนหน้าเข้าสู่ระบบเพื่อทำการรีเซ็ตรหัสผ่าน`
                }
            ]
        }
    ];

    return (
        <div className="faq_content">
            <h2 className="title-faq">FAQ’s</h2>
            {faqCategories.map((category, catIndex) => (
                <div className="faq_content_item_div" key={catIndex}>
                    <p className="faq_content_item_title">{category.title}</p>
                    {category.faqs.map((faq, index) => {
                        const faqIndex = `${catIndex}-${index}`; 
                        return (
                            <div key={faqIndex} className="faq_content_item">
                                <div className="faq_question" onClick={() => toggleFAQ(faqIndex)}>
                                    <p className="faq_question_p">{faq.question}</p>
                                    {openIndex === faqIndex ? <FaChevronUp className="faq_icon" /> : <FaChevronDown className="faq_icon" />}
                                </div>
                                {openIndex === faqIndex && (
                                    <p className="faq_answer" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default FAQ;
