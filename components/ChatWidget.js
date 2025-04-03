import { useState, useEffect, useRef } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I\'m the HSAPSS AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get context from last 3 messages for continuity
      const context = messages
        .slice(-3)
        .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n');

      // Call your API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, context })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add bot response to chat
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: "Sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-content loading">
              <div className="dot-typing"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .message {
          margin-bottom: 10px;
          max-width: 80%;
          word-wrap: break-word;
        }
        
        .user {
          align-self: flex-end;
        }
        
        .bot {
          align-self: flex-start;
        }
        
        .message-content {
          padding: 8px 12px;
          border-radius: 15px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .user .message-content {
          background-color: #4e73df;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .bot .message-content {
          background-color: #f0f2f5;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        
        .input-area {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ddd;
        }
        
        input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
          outline: none;
        }
        
        button {
          background-color: #4e73df;
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          margin-left: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
        }
        
        .dot-typing {
          position: relative;
          left: -9999px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: #666;
          color: #666;
          box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          animation: dot-typing 1.5s infinite linear;
        }
        
        @keyframes dot-typing {
          0% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          16.667% {
            box-shadow: 9984px -10px 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          33.333% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          50% {
            box-shadow: 9984px 0 0 0 #666, 9999px -10px 0 0 #666, 10014px 0 0 0 #666;
          }
          66.667% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
          83.333% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px -10px 0 0 #666;
          }
          100% {
            box-shadow: 9984px 0 0 0 #666, 9999px 0 0 0 #666, 10014px 0 0 0 #666;
          }
        }
      `}</style>
    </div>
  );
}