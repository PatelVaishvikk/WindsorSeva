import { useState, useRef, useEffect } from 'react';

export default function ChatBot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]); // each message: { sender: 'user' or 'ai', text: string }
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!query.trim()) return;
    const userMessage = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: messages.map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n')
        })
      });
      const data = await response.json();
      const aiMessage = { sender: 'ai', text: data.reply };
      setMessages(prev => [...prev, aiMessage]);
      setQuery('');
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ height: '300px', overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '10px 15px',
                borderRadius: '20px',
                background: msg.sender === 'user' ? '#4e73df' : '#e2e6ea',
                color: msg.sender === 'user' ? '#fff' : '#333',
                maxWidth: '80%'
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ padding: '10px 20px', marginLeft: '10px', borderRadius: '4px', border: 'none', background: '#4e73df', color: '#fff' }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
