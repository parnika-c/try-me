import React, { useEffect, useState } from "react";
import { Target, Compass, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, updateUser } from "../services/api.js";
import { fetchUsers } from "./LeaderboardLogic.jsx";
import { SelectAvatar } from "./selectAvatar.jsx";
import "./NavBar.css";

export const NavBar = ({ onLogout }) => {
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        // Call the parent's logout handler if provided, otherwise fallback to reload
        if (onLogout) {
            onLogout();
        } else {
            window.location.href = '/login';
        }
    };
    const menus = ["Profile", "Sign Out"];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === "/";
    const isLeaderboard = location.pathname === "/leaderboard";

    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const defaultAvatar = currentUserData.id ? `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUserData.id}` : 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png';
    const [avatar, setAvatar] = useState(defaultAvatar);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [rank, setRank] = useState('#--');
    const [points, setPoints] = useState('-- pts');

    const handleMenuClick = (menu) => {
        if (menu === 'Profile') {
            setAvatarOpen(true);
        } else if (menu === 'Sign Out') {
            handleLogout();
        }
        setIsMenuOpen(false);
    };

    const handleAvatarSelect = async (newAvatar) => {
        try {
            await updateUser(newAvatar);
            setAvatar(newAvatar);
        } catch (error) {
            console.error('Failed to update avatar:', error);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const currentUser = await getCurrentUser();
                const allUsers = await fetchUsers();
                const sortedUsers = allUsers.sort((a, b) => b.totalPoints - a.totalPoints);
                const userIndex = sortedUsers.findIndex(u => u.id === currentUser.id);
                const userRank = userIndex >= 0 ? userIndex + 1 : '--';
                setRank(typeof userRank === 'number' ? `#${userRank}` : '#--');
                setPoints(`${currentUser.totalPoints} pts`);
                setAvatar(currentUser.avatar || defaultAvatar);
            } catch (error) {
                console.error('Failed to load user data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    return (
        <>
        <nav className="navbar">
            <div className="nav-left">
                <div className="logo-section">
                    <span className="trophy">🏆</span>
                    <div className="text-group">
                        <h1 className="app-name">TryMe!</h1>
                        <p className="subtitle">Challenge yourself, compete with friends</p>
                    </div>
                </div>
            </div>
            <div className="nav-right">
                <div className="rank-card">
                    <span className="rank-text">
                        Rank: {rank}
                    </span>
                    <span className="divider">
                        |
                    </span>
                    <span className="points">
                        {points}
                    </span>
                    
                    <div className="profile">
                        <img className="profile-pic" 
                            src={avatar} 
                            alt="Profile Picture"
                            onMouseEnter={() => setIsMenuOpen(!isMenuOpen)}
                            />
                        {isMenuOpen && <div className="menu-dropdown">
                        <ul>
                            {menus.map((menu) => ( 
                                <li key={menu}>
                                    <button className="logout-btn" onClick={() => handleMenuClick(menu)}>
                                    {menu}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>}
                </div>
                </div>
            </div>
        </nav>
        <div className="bottom-nav">
            <button
            className={`nav-tab ${isDashboard ? "active" : ""}`}
            onClick={() => navigate("/")}
            >
                <Target size={18} />
                <span>My Challenges</span>
            </button>

            {/* leaderboard */}
            <button
            className={`nav-tab ${isLeaderboard ? "active" : ""}`}
            onClick={() => navigate("/leaderboard")}
            >
                <Trophy size={18} />
                <span>Leaderboard</span>
            </button>
        </div>
        <SelectAvatar
            open={avatarOpen}
            onOpenChange={setAvatarOpen}
            currentAvatar={avatar}
            onAvatarSelect={handleAvatarSelect}
        />
        </>
    );
};

