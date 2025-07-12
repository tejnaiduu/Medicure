import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Chat() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/login');
    fetchHistory();
  }, []);

  useEffect(() => {
    const closeDropdown = e => {
      if (!e.target.closest('.profile-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`, {
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

    const tempChat = {
      _id: Date.now(),
      query,
      response: 'Analyzing...'
    };

    setSelectedHistory(tempChat);
    setQuery('');

    try {
      const res = await axios.post(
        `${API_URL}/chat`,
        { query },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newChat = res.data.chat;
      setHistory(prev => [...prev, newChat]);
      setSelectedHistory(newChat);
    } catch (err) {
      alert('Error sending message');
    }
  };

  const handleSelectHistory = chat => {
    setSelectedHistory(chat);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${API_URL}/history/${id}`, {
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
      await axios.delete(`${API_URL}/history`, {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="chat-page">
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>👩‍⚕️ Medicure</h3>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>+ New Chat</button>

        <div className="sidebar-subheader">
          <h4>Your Chats</h4>
          <button onClick={handleDeleteAll} title="Delete All" className="clear-btn">🗙</button>
        </div>

        <ul className="chat-history-list">
          {history.length === 0 && <p className="no-history">No history yet</p>}
          {history.map((item, index) => (
            <li key={item._id || index} className={selectedHistory?._id === item._id ? 'selected' : ''}>
              <button onClick={() => handleSelectHistory(item)}>
                💬 {item.query.slice(0, 25)}...
              </button>
              <span onClick={() => handleDelete(item._id)} className="delete-icon">🗙</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-main">
        <div className="chat-main-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2><span style={{ color: '#00bfff', fontWeight: 'bold' }}>👩‍⚕️ Medicure</span> — Your Health Companion</h2>
          <div className="profile-dropdown">
            <button className="profile-icon" onClick={() => setShowDropdown(!showDropdown)}>
              👤
            </button>
            <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>

        <div className="chat-box">
          {selectedHistory ? (
            <div className="chat-messages">
              <div className="message user-message">
                <p>{selectedHistory.query}</p>
              </div>
              <div className="message bot-message">
                <p>{selectedHistory.response}</p>
              </div>
            </div>
          ) : (
            <div className="welcome-message">
              <h3>Hi there! 👋</h3>
              <p>I’m <strong>Medicure</strong> — your AI health assistant.</p>
              <p>Ask me any health-related question and I’ll try to help.</p>
            </div>
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
