import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Group } from '../interfaces';
import Header from './Header';
import Sidebar from './Sidebar';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/groups`)
      .then(response => response.json())
      .then((data: Group[]) => setGroups(data))
      .catch(error => console.error('Error fetching groups:', error));
  }, []);

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
          <div className="messages">
            <div className="welcome-message">
              <h2>Welcome to Mathu Kathe!</h2>
              <p>Select a group from the sidebar to start chatting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;