import React from 'react';
import { NavBar } from '../components/NavBar.jsx';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import './Leaderboard.css'; // added CSS import

const Card = ({ className = '', children }) => <div className={`card ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="card-header">{children}</div>;
const CardTitle = ({ children }) => <h3 className="card-title">{children}</h3>;
const CardDescription = ({ children }) => <p className="card-desc">{children}</p>;
const CardContent = ({ className='', children }) => <div className={`card-content ${className}`}>{children}</div>;
const Avatar = ({ className='', children }) => <div className={`avatar ${className}`}>{children}</div>;
const AvatarImage = ({ src, alt }) => <img src={src} alt={alt} className="avatar-img" />;
const AvatarFallback = ({ children }) => <div className="avatar-fallback">{children}</div>;
const Badge = ({ className='', children, variant }) => <span className={`badge ${variant||''} ${className}`}>{children}</span>;

const mockUsers = [
  { id: 'user-1', name: 'Sarah Chen', avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png', totalPoints: 1580 },
  { id: 'user-2', name: 'Mike Johnson', avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png', totalPoints: 1420 },
  { id: 'user-3', name: 'You', avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922656.png', totalPoints: 1250 },
  { id: 'user-4', name: 'Alice', avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922688.png', totalPoints: 1100 },
  { id: 'user-5', name: 'Bob', avatar: 'https://cdn-icons-png.flaticon.com/512/2922/2922565.png', totalPoints: 950 }
];

const getRankIcon = (rank) => {
  if (rank === 1) return <Trophy className="rank-icon trophy-icon" />;
  if (rank === 2) return <Medal className="rank-icon medal-icon" />;
  if (rank === 3) return <Award className="rank-icon award-icon" />;
  return null;
};

const getRankBadge = (rank) => {
  if (rank === 1) return <Badge className="rank-badge badge-champion">Champion</Badge>;
  if (rank === 2) return <Badge className="rank-badge badge-runnerup">Runner-up</Badge>;
  if (rank === 3) return <Badge className="rank-badge badge-third">3rd Place</Badge>;
  return null;
};

export function Leaderboard() {
  const sortedUsers = [...mockUsers].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <>
      <NavBar />
      <main className="dashboard-container">
        <div className="leaderboard-header">
          <h2 className="leaderboard-title">Global Leaderboard</h2>
          <p className="leaderboard-subtitle">Top players ranked by total points earned across all challenges.</p>
        </div>

        {/* Top 3 Podium */}
        <div className="podium">
          {(() => {
            const top3 = sortedUsers.slice(0, 3);
            // Display order: 2nd (left), 1st (center), 3rd (right)
            const displayOrder = [
              { user: top3[1], rank: 2 },
              { user: top3[0], rank: 1 },
              { user: top3[2], rank: 3 }
            ];
            return displayOrder.map(({ user, rank }) => {
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              return (
                <Card key={user.id} className={`podium-card ${isFirst?'podium-first':''} ${isSecond?'podium-second':''} ${isThird?'podium-third':''}`}>
                  <CardContent className="podium-content">
                    <div className="podium-icon">{getRankIcon(rank)}</div>
                    <Avatar className="podium-avatar"> 
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="podium-name">{user.name}</p>
                    <p className="podium-points">{user.totalPoints}</p>
                    <p className="podium-points-label">points</p>
                    {getRankBadge(rank)}
                  </CardContent>
                </Card>
              );
            });
          })()}
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
                  const isCurrentUser = user.name === 'You';
                  return (
                    <div key={user.id} className={`ranking-row ${isCurrentUser?'current-user':''}`}>
                      <div className="ranking-left">
                        <div className="ranking-icon">
                          {rank<=3 ? getRankIcon(rank) : <span className="rank-text">#{rank}</span>}
                        </div>
                        <Avatar className="ranking-avatar">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="ranking-info">
                          <p className="ranking-name">{user.name} {isCurrentUser && <span className="you-tag">You</span>}</p>
                          {rank<=10 && (
                            <p className="ranking-top10"><TrendingUp /> Top 10 Player</p>
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
      </main>
    </>
  );
}

export default Leaderboard;