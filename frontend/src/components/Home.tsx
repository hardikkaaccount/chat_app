import React, { useState, useEffect } from 'react';
import { User, Group } from '../interfaces';
import Dashboard from './Dashboard';
import GroupPage from './GroupPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

interface HomeProps {
  currentUser: User;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ currentUser, onLogout }) => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/groups`)
      .then(response => response.json())
      .then((data: Group[]) => setGroups(data))
      .catch(error => console.error('Error fetching groups:', error));
  }, []);

  // Since we're using routing now, we'll just render the Dashboard here
  // The GroupPage will be rendered when the user navigates to /group/:id
  return (
    <Dashboard currentUser={currentUser} onLogout={onLogout} />
  );
};

export default Home;