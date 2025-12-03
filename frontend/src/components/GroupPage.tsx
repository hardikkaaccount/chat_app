import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Group, Message } from '../interfaces';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

interface GroupPageProps {
  currentUser: User;
  onLogout: () => void;
  groups: Group[];
}

const GroupPage: React.FC<GroupPageProps> = ({ currentUser, onLogout, groups }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<number>(parseInt(id || '1'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (id) {
      setCurrentGroupId(parseInt(id));
      fetch(`${BACKEND_URL}/api/messages/${id}`)
        .then(response => response.json())
        .then((data: Message[]) => setMessages(data))
        .catch(error => console.error('Error fetching messages:', error));
    }
  }, [id]);

  const sendMessage = (content: string) => {
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
        <ChatArea messages={messages} onSendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default GroupPage;