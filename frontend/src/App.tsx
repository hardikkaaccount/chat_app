import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './Login';
import { User, Group, Message } from './interfaces';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentGroup, setCurrentGroup] = useState(1);
  const [groups, setGroups] = useState<Group[]>([]);

  // Fetch groups
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/groups`)
      .then(response => response.json())
      .then((data: Group[]) => setGroups(data))
      .catch(error => console.error('Error fetching groups:', error));
  }, []);

  // Fetch messages for current group
  useEffect(() => {
    if (currentUser) {
      fetch(`${BACKEND_URL}/api/messages/${currentGroup}`)
        .then(response => response.json())
        .then((data: Message[]) => setMessages(data))
        .catch(error => console.error('Error fetching messages:', error));
    }
  }, [currentGroup, currentUser]);

  const sendMessage = () => {
    if (!currentUser) return;
    if (newMessage.trim() === '') return;

    fetch(`${BACKEND_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: currentGroup,
        senderId: currentUser.id,
        content: newMessage,
        username: currentUser.username
      }),
    })
      .then(response => response.json())
      .then((data: Message) => {
        setMessages([...messages, data]);
        setNewMessage('');
      })
      .catch(error => console.error('Error sending message:', error));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Chat App</h1>
        <div className="user-info">
          <span>Logged in as: {currentUser.username}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="main-content">
        <div className="sidebar">
          <h2>Groups</h2>
          <ul>
            {groups.map(group => (
              <li 
                key={group.id} 
                className={group.id === currentGroup ? 'active' : ''}
                onClick={() => setCurrentGroup(group.id)}
              >
                {group.name}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="chat-area">
          <div className="messages">
            {messages.map(message => (
              <div key={message.id} className="message">
                <strong>{message.username || 'Unknown'}:</strong> {message.content}
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;