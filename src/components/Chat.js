import { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../css/chatbot.css'; 

function Chat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!question.trim()) return;

    const userMessage = { type: 'user', text: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const res = await axios.post('http://localhost:3001/chat/chatbot', {
        question: question
      });
      
      const botMessage = { 
        type: 'bot', 
        text: res.data.answer, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      
    } catch (err) {
      const errorMessage = { 
        type: 'bot', 
        text: 'เกิดข้อผิดพลาดในการติดต่อแชทบอท', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
    
    setQuestion('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading && question.trim()) {
      handleSubmit(e);
    }
  };

  return (
    <div className="floating-chat-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window card shadow-lg mb-3">
          {/* Header */}
          <div className="chat-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-semibold">แชทบอทระบบศิษย์เก่า</h6>
            <button 
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setIsOpen(true)}
              aria-label="Close"
            ></button>
          </div>
          
          {/* Messages Area */}
          <div className="chat-messages bg-light p-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted py-4">
                <small>สวัสดีครับ! มีอะไรให้ช่วยเหลือเกี่ยวกับระบบศิษย์เก่าไหมครับ?</small>
              </div>
            ) : (
              <div className="messages-container">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message-wrapper mb-3 d-flex ${
                      message.type === 'user' ? 'justify-content-end' : 'justify-content-start'
                    }`}
                  >
                    <div
                      className={`message-bubble px-3 py-2 rounded-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-white user-message' 
                          : 'bg-white border shadow-sm bot-message'
                      }`}
                    >
                      <small>{message.text}</small>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message-wrapper mb-3 d-flex justify-content-start">
                    <div className="message-bubble bg-white border shadow-sm px-3 py-2 rounded-3 bot-message">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="chat-input p-3 border-top bg-white">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="พิมพ์คำถามเกี่ยวกับระบบศิษย์เก่า..."
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading || !question.trim()}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
                ส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;