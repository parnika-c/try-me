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


  // Fetch user stats for a challenge
  const fetchUserStats = async (challengeId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/challenges/${challengeId}/check-ins/me`,
        { credentials: "include" }
      );
      // 404 means user is not a participant, which is fine
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error(`Failed to load stats: ${res.status}`);
      }
      // return the stats
      const data = await res.json();
      return {
        currentStreak: data.participant.currentStreak, // return the current streak
        totalPoints: data.participant.totalPoints // return the total points
      };
    } catch (err) {
      console.error(`Error fetching user stats for challenge ${challengeId}:`, err);
      return null;
    }
  };

  // Fetch challenges from backend
  useEffect(() => {  //first render useEffect to fetch challenges from backend
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
        setChallenges(data); //sets challenges to data from backend initially before any user interaction
      } catch (err) {
        setError(err.message);
        console.error("Error fetching challenges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // second rerender - fetch stats for all challenges when userData and challenges are available
  useEffect(() => {
    const fetchAllStats = async () => {
      // Check for both id and _id since verifyAuth returns 'id' but login might return '_id'
      const userId = userData?.id || userData?._id;
      if (!userId || challenges.length === 0) {
        return;
      }

      console.log('Fetching stats for', challenges.length, 'challenges');
      const statsPromises = challenges.map(async (challenge) => {
        const stats = await fetchUserStats(challenge._id);
        return { challengeId: challenge._id, stats };
      });

      const statsResults = await Promise.all(statsPromises); 
      const statsMap = {}; 
      statsResults.forEach(({ challengeId, stats }) => {
        if (stats) {
          statsMap[challengeId] = stats; // only add if stats exist
        }
      });
      console.log('Fetched stats:', Object.keys(statsMap).length, 'challenges');
      setUserStatsByChallenge(statsMap); 
    };

    fetchAllStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, userData?._id, challenges.length]);

  const handleNewChallenge = (newChallenge) => {
    setChallenges(prev => [newChallenge, ...prev]);
  };

  // user joining new challenge
  const handleJoinChallenge = async (joinedChallenge) => {
    setChallenges(prev => {
      const exists = prev.some(c => c._id === joinedChallenge._id);
      if (exists) {
        return prev.map(c => c._id === joinedChallenge._id ? joinedChallenge : c);
      }
      return [joinedChallenge, ...prev];
    });
    
    // Fetch stats for the newly joined challenge

    const userId = userData?.id || userData?._id;
    if (userId) {
      const stats = await fetchUserStats(joinedChallenge._id); //
      if (stats) {
        setUserStatsByChallenge(prev => ({
          ...prev,
          [joinedChallenge._id]: stats
        }));
      }
    }
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
              {challenges.map((c) => ( //map over challenges to show ChallengeCard for each challenge
                <ChallengeCard
                  key={c._id}
                  challenge={c}
                  onClick={() => setSelectedChallenge(c)}
                  userStats={userStatsByChallenge[c._id]}
                  currentUserId={userData?.id || userData?._id} 
                />
              ))}
            </div>
          </>
        )}
        {selectedChallenge && (
          <ChallengeDetails
            challenge={selectedChallenge}
            onBack={() => setSelectedChallenge(null)}
            currentUserId={userData?.id || userData?._id}
            onStatsUpdate={(stats) => {
              setUserStatsByChallenge(prev => ({
                ...prev,
                [selectedChallenge._id]: stats
              }));
            }}

          />
        )}
      </div>
    </>
  );
}

export default Dashboard;
