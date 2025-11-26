import React, { useState, useEffect } from 'react';
import CreateChallenge from '../components/CreateChallenge';
import { NavBar } from '../components/NavBar';
import { ChallengeCard } from '../components/ChallengeCard'
import { ChallengeDetails } from "../components/ChallengeDetails"
import JoinChallenge from '../components/JoinChallenge';
import './Dashboard.css';

function Dashboard() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null)

  // Fetch challenges from backend
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/challenges", {
          credentials: "include", // send cookies
        });

        if (!res.ok) throw new Error("Failed to load challenges");
        const data = await res.json();
        console.log("Fetched challenges:", data);
        setChallenges(data);
      } catch (err) {
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

  //user joining new challenge 
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

  return (
    <>
        <NavBar />
        <div className="dashboard-container">
          <CreateChallenge onCreateChallenge={handleNewChallenge} />
          <JoinChallenge onJoinChallenge={handleJoinChallenge} />
          <div className="cards-grid">
            {challenges.map((c) => (
              <ChallengeCard key={c._id} challenge={c} onClick={() => handleClick(c)} />
            ))}
          </div>
          

          
          {!selectedChallenge && (
            <>
              <div className="dashboard-header">
                <div className="header-left">
                  <h1 className="dashboard-title">My Challenges</h1>
                  <p>Track your active and upcoming challenges</p>
                </div>

                <div className="header-right">
                  <CreateChallenge onCreateChallenge={handleNewChallenge} />
                  <JoinChallenge />
                </div>
              </div>

              <div className="cards-grid">
                {challenges.map((c) => (
                  <ChallengeCard key={c._id} challenge={c} onClick={() => setSelectedChallenge(c)} />
                ))}
              </div>
            </>
          )}

          {selectedChallenge && 
            <ChallengeDetails
              challenge={selectedChallenge}
              onBack={() => setSelectedChallenge(null)}
            />
          }
        </div>
    </>
  );
};

export default Dashboard;
