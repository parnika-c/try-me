import React from 'react';

export function GlobalLeaderboard() {
  const sortedUsers = [...mockUsers].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div>
      <div>
        <h2>Global Leaderboard</h2>
        <p>Top players ranked by total points earned across all challenges</p>
      </div>

      <div>
        {sortedUsers.slice(0, 3).map((user, index) => {
          const rank = index + 1;
          return (
            <Card key={user.id}>
              <CardContent>
                <div>{getRankIcon(rank)}</div>
                <Avatar src={user.avatar} alt={user.name} />
                <p>{user.name}</p>
                <p>{user.totalPoints}</p>
                <p>points</p>
                {getRankBadge(rank)}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Players</CardTitle>
          <CardDescription>Complete rankings of all participants</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            {sortedUsers.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === 'user-1';
              return (
                <div key={user.id}>
                  <div>
                    <div>
                      {rank <= 3 ? getRankIcon(rank) : <span>#{rank}</span>}
                    </div>
                    <Avatar src={user.avatar} alt={user.name} />
                    <div>
                      <div>
                        <p>{user.name}</p>
                        {isCurrentUser && <Badge>You</Badge>}
                      </div>
                      {rank <= 10 && (
                        <p>
                          <TrendingUp size={14} /> Top 10 Player
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p>{user.totalPoints}</p>
                    <p>points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default GlobalLeaderboard;