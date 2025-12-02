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
  const [statusFilter, setStatusFilter] = useState('all');


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
  

  // Calculate status based on dates
  const calculateStatus = (challenge) => {
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    
    if (now < start) return "Upcoming";
    if (now > end) return "Previous";
    return "Active";
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
        
        // Sort challenges by start date (most recent first)
        const sortedChallenges = data.sort((a, b) => 
          new Date(b.startDate) - new Date(a.startDate)
        );

        setChallenges(sortedChallenges);
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
  setChallenges(prev => [newChallenge, ...prev].sort((a, b) => 
    new Date(b.startDate) - new Date(a.startDate)
  ));
};

  // user joining new challenge
  const handleJoinChallenge = async (joinedChallenge) => {
    setChallenges(prev => {
      const exists = prev.some(c => c._id === joinedChallenge._id);
      if (exists) {
        return prev
          .map(c => (c._id === joinedChallenge._id ? joinedChallenge : c))
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate);
      }
      return [joinedChallenge, ...prev].sort((a, b) => 
      new Date(b.startDate) - new Date(a.startDate)
    );
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

   // Filter challenges based on status
  const filteredChallenges = challenges.filter(challenge => {
    if (statusFilter === 'all') return true;
    return challenge.status === statusFilter;
  });

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
                <p className="dashboard-subtitle">Track your active and upcoming challenges</p>
              </div>
              <div className="header-right">
                <CreateChallenge onCreateChallenge={handleNewChallenge} />
                <JoinChallenge onJoinChallenge={handleJoinChallenge} />
              </div>
            </div>
            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Active')}
              >
                Active
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'Upcoming' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'Previous' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Previous')}
              >
                Previous
              </button>
            </div>
            <div className="cards-grid">
              {filteredChallenges.length === 0 && (
                <p className="empty-state">
                  {statusFilter === 'all' 
                    ? 'You have no challenges yet. Create or join one to get started.'
                    : `No ${statusFilter.toLowerCase()} challenges found.`
                  }
                </p>
              )}
              {filteredChallenges.map((c) => (
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
