import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';
import { useNavigate } from 'react-router-dom';

function Chat() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:5000/chat',
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChat = {
        _id: Date.now(), // Temporary ID for frontend
        query,
        response: res.data.response
      };
      setHistory(prev => [...prev, newChat]);
      setSelectedHistory(newChat);
      setQuery('');
    } catch (err) {
      alert('Error sending message');
    }
  };

  const handleSelectHistory = chat => {
    setSelectedHistory(chat);
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`http://localhost:5000/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory();
      if (selectedHistory?._id === id) {
        setSelectedHistory(null);
      }
    } catch (err) {
      alert('Failed to delete history item');
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete(`http://localhost:5000/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
      setSelectedHistory(null);
    } catch (err) {
      alert('Failed to delete all history');
    }
  };

  const handleNewChat = () => {
    setSelectedHistory(null);
    setQuery('');
    setResponse('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h3>Medicure</h3>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>+ New Chat</button>

        <div className="sidebar-subheader">
          <h4>Your Chats</h4>
          <button onClick={handleDeleteAll} title="Delete All" className="clear-btn">🗙</button>
        </div>

        <ul className="chat-history-list">
          {history.length === 0 && <p className="no-history">No history yet</p>}
          {history.map((item, index) => (
            <li key={item._id || index} className={selectedHistory === item ? 'selected' : ''}>
              <button onClick={() => handleSelectHistory(item)}>
                {item.query.slice(0, 30)}...
              </button>
              <span onClick={() => handleDelete(item._id)} title="Delete" className="delete-icon">🗙</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-main">
        <h2>Medicure Chatbot</h2>
        <div className="chat-box">
          {selectedHistory ? (
            <div className="chat-message">
              <p><strong>You:</strong> {selectedHistory.query}</p>
              <p><strong>Bot:</strong> {selectedHistory.response}</p>
            </div>
          ) : (
            <p className="no-chat-selected">Start a new conversation or select one from the left.</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="chat-input">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask your medical question..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
