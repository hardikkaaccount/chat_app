import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Group } from '../interfaces';

interface SidebarProps {
  groups: Group[];
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, isOpen = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  // Extract current group ID from URL
  const getCurrentGroupId = () => {
    const match = location.pathname.match(/\/group\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const currentGroupId = getCurrentGroupId();

  const handleCreateGroup = () => {
    if (newGroupName.trim() === '') return;
    
    // For now, we'll just log the new group creation
    // In a real app, this would make an API call
    console.log('Creating group:', newGroupName, newGroupDescription);
    
    setNewGroupName('');
    setNewGroupDescription('');
    setShowCreateGroup(false);
  };

  const handleGroupSelect = (groupId: number) => {
    navigate(`/group/${groupId}`);
  };

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h2>Groups</h2>
        <button onClick={() => setShowCreateGroup(true)} className="create-group-btn">+</button>
      </div>
      
      {showCreateGroup && (
        <div className="create-group-form">
          <input
            type="text"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <textarea
            placeholder="Group description"
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
          />
          <div className="form-actions">
            <button onClick={handleCreateGroup}>Create</button>
            <button onClick={() => {
              setShowCreateGroup(false);
              setNewGroupName('');
              setNewGroupDescription('');
            }}>Cancel</button>
          </div>
        </div>
      )}
      
      <ul>
        {groups.map(group => (
          <li 
            key={group.id} 
            className={group.id === currentGroupId ? 'active' : ''}
            onClick={() => handleGroupSelect(group.id)}
          >
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;