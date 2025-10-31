import React, { useState } from 'react';
import { CreateChallenge } from '../components/CreateChallenge';
import { NavBar } from '../components/NavBar';
import JoinChallenge from '../components/JoinChallenge';
import './Dashboard.css';

function Dashboard() {
  return (
    <>
        <NavBar />
        <div className="dashboard-container">
          <CreateChallenge />
          <JoinChallenge />
        </div>
    </>
    
  );
};

export default Dashboard;
