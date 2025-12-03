import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Group, Message } from '../interfaces';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

interface ChatInterfaceProps {
  currentUser: User;
  onLogout: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch groups on component mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/groups`)
      .then(response => response.json())
      .then((data: Group[]) => setGroups(data))
      .catch(error => console.error('Error fetching groups:', error));
  }, []);

  // Fetch messages when group changes
  useEffect(() => {
    if (id) {
      const groupId = parseInt(id);
      setCurrentGroupId(groupId);
      
      fetch(`${BACKEND_URL}/api/messages/${groupId}`)
        .then(response => response.json())
        .then((data: Message[]) => setMessages(data))
        .catch(error => console.error('Error fetching messages:', error));
    } else {
      // If no group ID in URL, show welcome message
      setCurrentGroupId(null);
      setMessages([]);
    }
  }, [id]);

  const sendMessage = (content: string) => {
    if (!currentGroupId) return;
    
    fetch(`${BACKEND_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: currentGroupId,
        senderId: currentUser.id,
        content: content,
        username: currentUser.username
      }),
    })
      .then(response => response.json())
      .then((data: Message) => {
        setMessages([...messages, data]);
      })
      .catch(error => console.error('Error sending message:', error));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app">
      <Header username={currentUser.username} onLogout={onLogout} toggleSidebar={toggleSidebar} />
      <div className="main-content">
        <Sidebar 
          groups={groups}
          isOpen={isSidebarOpen}
        />
        <div className="chat-area">
          {currentGroupId ? (
            <ChatArea messages={messages} onSendMessage={sendMessage} />
          ) : (
            <div className="messages">
              <div className="welcome-message">
                <h2>Welcome to Mathu Kathe!</h2>
                <p>Select a group from the sidebar to start chatting.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;