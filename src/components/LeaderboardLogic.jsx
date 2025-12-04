import React from 'react';
// Encapsulated logic and data for the Leaderboard page

export const getSortedUsers = (users) => [...users].sort((a, b) => b.totalPoints - a.totalPoints);

export const getTop3DisplayOrder = (sortedUsers) => {
  const top3 = sortedUsers.slice(0, 3);
  return [
    { user: top3[1], rank: 2 },
    { user: top3[0], rank: 1 },
    { user: top3[2], rank: 3 }
  ];
};

// Returns metadata for a given rank. UI maps this to icons/badges.
export const getRankMeta = (rank) => {
  if (rank === 1) return { icon: 'trophy', badge: { label: 'Champion', variantClass: 'badge-champion' } };
  if (rank === 2) return { icon: 'medal', badge: { label: 'Runner-up', variantClass: 'badge-runnerup' } };
  if (rank === 3) return { icon: 'award', badge: { label: '3rd Place', variantClass: 'badge-third' } };
  return { icon: null, badge: null };
};

export const isTop10 = (rank) => rank <= 10;

export const fetchUsers = async () => {
  const url = 'http://localhost:4000/api/users';

  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const resClone = res.clone();
  let payload;
  try {
    payload = await res.json();
  } catch {
    const text = await resClone.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText} (${url})${text ? ` - ${text.slice(0, 200)}` : ''}`);
    }
    throw new Error(`Expected JSON but received ${(res.headers.get('content-type')||'unknown')}. First bytes: ${text.slice(0, 80)}`);
  }

  if (!res.ok) {
    const details = typeof payload === 'object' ? JSON.stringify(payload).slice(0, 200) : '';
    throw new Error(`HTTP ${res.status} ${res.statusText} (${url})${details ? ` - ${details}` : ''}`);
  }

  const list = Array.isArray(payload) ? payload : payload.users || [];

  return list
    .filter(u => typeof u.totalPoints === 'number')
    .map(u => {
      const { id, displayName, avatar } = getAvatarProps(u);
      return {
        id,
        name: displayName,
        avatar,
        totalPoints: u.totalPoints || 0,
      };
    });
};

export const isCurrentUser = (displayName) => {
  try {
    // Expect the app to cache the current user object in localStorage under 'currentUser'
    // e.g., after successful login or getCurrentUser(): localStorage.setItem('currentUser', JSON.stringify(user))
    const raw = localStorage.getItem('currentUser');
    if (!raw) return false;
    const u = JSON.parse(raw);
    const first = (u?.firstName || '').trim();
    const last = (u?.lastName || '').trim();
    const full = [first, last].filter(Boolean).join(' ').trim();
    if (!full) return false;
    return (full.toLowerCase() === (displayName || '').toLowerCase());
  } catch {
    return false;
  }
};
//export avatar in leaderboard
export const getAvatarProps = (u = {}) => {
  const id = u._id || u.id;
  const first = u.firstName || '';
  const last = u.lastName || '';
  const name = `${first} ${last}`.trim() || u.name || 'Unknown';

  const seed = id || name || Math.random().toString(36).slice(2);
  const avatar = u.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  const fallbackChar = name.charAt(0).toUpperCase();

  return { id, displayName: name, avatar, fallbackChar };
};


// UI primitives used by Leaderboard UI (exported for reuse)
export const renderRankIcon = (icon) => {
  if (icon === 'trophy') return <Trophy className="rank-icon trophy-icon" />;
  if (icon === 'medal') return <Medal className="rank-icon medal-icon" />;
  if (icon === 'award') return <Award className="rank-icon award-icon" />;
  return null;
};
export const Card = ({ className = '', children }) => <div className={`card ${className}`}>{children}</div>;
export const CardHeader = ({ children }) => <div className="card-header">{children}</div>;
export const CardTitle = ({ children }) => <h3 className="card-title">{children}</h3>;
export const CardDescription = ({ children }) => <p className="card-desc">{children}</p>;
export const CardContent = ({ className='', children }) => <div className={`card-content ${className}`}>{children}</div>;
export const Avatar = ({ className='', children }) => <div className={`avatar ${className}`}>{children}</div>;
export const AvatarImage = ({ src, alt }) => <img src={src} alt={alt} className="avatar-img" />;
export const AvatarFallback = ({ children }) => <div className="avatar-fallback">{children}</div>;
export const Badge = ({ className='', children, variant }) => <span className={`badge ${variant||''} ${className}`}>{children}</span>;
