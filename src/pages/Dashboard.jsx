import React, { useState, useEffect } from 'react';
import CreateChallenge from '../components/CreateChallenge';
import { NavBar } from '../components/NavBar';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChallengeDetails } from "../components/ChallengeDetails";
import JoinChallenge from '../components/JoinChallenge';
import './Dashboard.css';

function Dashboard({ onShowMfa, onLogout, userData }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [userStatsByChallenge, setUserStatsByChallenge] = useState({});


  // Fetch challenges from backend
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/challenges", {
          credentials: "include",
        });

        if (!res.ok) {
          const msg = `Failed to load challenges (status ${res.status})`;
          throw new Error(msg);
        }
        const data = await res.json();
        setChallenges(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching challenges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const handleNewChallenge = (newChallenge) => {
    setChallenges(prev => [newChallenge, ...prev]);
  };

  // user joining new challenge
  const handleJoinChallenge = (joinedChallenge) => {
    setChallenges(prev => {
      const exists = prev.some(c => c._id === joinedChallenge._id);
      if (exists) {
        return prev.map(c => c._id === joinedChallenge._id ? joinedChallenge : c);
      }
      return [joinedChallenge, ...prev];
    });
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading your challenges...</p>;
  if (error) return <p style={{ textAlign: "center", color: 'red' }}>{error}</p>;

  return (
    <>
      <NavBar onLogout={onLogout} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem' }}>
        <button onClick={() => onShowMfa?.()} className="mfa-setup-btn">Set up MFA</button>
      </div>
      <div className="dashboard-container">
        {!selectedChallenge && (
          <>
            <div className="dashboard-header">
              <div className="header-left">
                <h1 className="dashboard-title">My Challenges</h1>
                <p>Track your active and upcoming challenges</p>
              </div>
              <div className="header-right">
                <CreateChallenge onCreateChallenge={handleNewChallenge} />
                <JoinChallenge onJoinChallenge={handleJoinChallenge} />
              </div>
            </div>
            <div className="cards-grid">
              {challenges.length === 0 && (
                <p className="empty-state">
                  You have no challenges yet. Create or join one to get started.
                </p>
              )}
              {challenges.map((c) => (
                <ChallengeCard
                  key={c._id}
                  challenge={c}
                  onClick={() => setSelectedChallenge(c)}
                  userStats={userStatsByChallenge[c._id]}
                />
              ))}
            </div>
          </>
        )}
        {selectedChallenge && (
          <ChallengeDetails
            challenge={selectedChallenge}
            onBack={() => setSelectedChallenge(null)}
            currentUserId={userData?._id}
            onStatsUpdate={(stats) =>
              setUserStatsByChallenge(prev => ({
                ...prev,
                [selectedChallenge._id]: stats
              }))
            }

          />
        )}
      </div>
    </>
  );
}

export default Dashboard;
