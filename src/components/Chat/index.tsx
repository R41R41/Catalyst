import React, { useState } from 'react';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput('');
      // AIとの対話をここで処理
    }
  };

  return (
    <div style={{ padding: '10px', height: '100%', overflowY: 'auto' }}>
      <div>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '5px 0' }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        style={{ width: '100%', padding: '5px' }}
      />
    </div>
  );
};

export default Chat; 