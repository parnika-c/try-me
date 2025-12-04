import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/NavBar.jsx';
import { TrendingUp } from 'lucide-react';
import './Leaderboard.css';
import { 
  getSortedUsers, 
  getTop3DisplayOrder, 
  getRankMeta, 
  isTop10, 
  isCurrentUser,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  fetchUsers,
  renderRankIcon
} from '../components/LeaderboardLogic.jsx';

const renderPodium = (sortedUsers) => {
  const displayOrder = getTop3DisplayOrder(sortedUsers);
  return displayOrder
    .filter(({ user }) => user)
    .map(({ user, rank }) => {
      const meta = getRankMeta(rank);
      const current = isCurrentUser(user.name);
      const displayName = current ? 'You' : user.name;
      const fallbackChar = current ? 'Y' : (user.name || 'U')[0];
      return (
        <Card key={user.id} className={`podium-card podium-${rank === 1 ? 'first' : rank === 2 ? 'second' : 'third'}`}>
          <CardContent className="podium-content">
            <div className="podium-icon">{renderRankIcon(meta.icon)}</div>
            <Avatar className="podium-avatar">
              <AvatarImage src={user.avatar} alt={displayName} />
              <AvatarFallback>{fallbackChar}</AvatarFallback>
            </Avatar>
            <p className="podium-name">{displayName}</p>
            <p className="podium-points">{user.totalPoints}</p>
            <p className="podium-points-label">points</p>
            {meta.badge && (
              <Badge className={`rank-badge ${meta.badge.variantClass}`}>{meta.badge.label}</Badge>
            )}
          </CardContent>
        </Card>
      );
    });
};

export function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await fetchUsers();
        if (mounted) setUsers(data);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load leaderboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refetch every 10 seconds

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const sortedUsers = getSortedUsers(users);

  return (
    <>
      <NavBar />
      <main className="leaderboard-wrapper">
        <div className="leaderboard-header">
          <h1 className="leaderboard-title">Global Leaderboard</h1>
          <p className="leaderboard-subtitle">Top players ranked by total points earned across all challenges.</p>
        </div>

        {loading && <p>Loading leaderboard...</p>}
        {error && <p>Failed to load: {error}</p>}

        {!loading && !error && sortedUsers.length > 0 && (
          <>
            {/* Top 3 Podium */}
            <div className="podium">
              {renderPodium(sortedUsers)}
            </div>

            {/* Full Rankings */}
            <div className="all-players-section">
              <Card className="all-players-card">
                <CardHeader>
                  <CardTitle>All Players</CardTitle>
                  <CardDescription>Complete rankings of all participants.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rankings">
                    {sortedUsers.map((user,index)=>{
                      const rank = index+1;
                      const meta = getRankMeta(rank);
                      const current = isCurrentUser(user.name);
                      const displayName = current ? 'You' : user.name;
                      const fallbackChar = current ? 'Y' : (user.name || 'U')[0];
                      return (
                        <div key={user.id} className={`ranking-row ${current?'current-user':''}`}>
                          <div className="ranking-left">
                            <div className="ranking-icon">
                              {rank<=3 ? renderRankIcon(meta.icon) : <span className="rank-text">#{rank}</span>}
                            </div>
                            <Avatar className="ranking-avatar">
                              
                              <AvatarImage src={user.avatar} alt={displayName} />
                              <AvatarFallback>{fallbackChar}</AvatarFallback>
                            </Avatar>
                            <div className="ranking-info">
                              <p className="ranking-name">{displayName} {current && <span className="you-tag"></span>}</p>
                              {isTop10(rank) && (
                                <p className="ranking-top10"><TrendingUp />    Top 10 Player</p>
                              )}
                            </div>
                          </div>
                          <div className="ranking-right">
                            <p className="ranking-points">{user.totalPoints}</p>
                            <p className="ranking-points-label">points</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Leaderboard;