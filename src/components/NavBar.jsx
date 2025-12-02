import React, { useState } from "react";
import { Target, Compass, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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
    const menus = ["Sign Out"];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === "/";
    const isLeaderboard = location.pathname === "/leaderboard";
    return (
        <>
        <nav className="navbar">
            <div className="nav-left">
                <div className="logo-section">
                    <span className="trophy">
                        <Trophy/>
                    </span>
                    <div className="text-group">
                        <h1 className="app-name">TryMe!</h1>
                        <p className="subtitle">Challenge yourself, compete with friends</p>
                    </div>
                </div>
            </div>
            <div className="nav-right">
                <div className="rank-card">
                    <span className="rank-text">
                        Rank: #3
                    </span>
                    <span className="divider">
                        |
                    </span>
                    <span className="points">
                        1250 pts
                    </span>
                    
                    <div className="profile">
                        <img className="profile-pic" 
                            src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" 
                            alt="Profile Picture"
                            onMouseEnter={() => setIsMenuOpen(!isMenuOpen)}
                            />
                        {isMenuOpen && <div className="menu-dropdown">   
                        <ul>
                            {menus.map((menu) => ( 
                                <li 
                                    key={menu}>
                                    <button className="logout-btn" onClick={handleLogout}>
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
            {}
            <button
            className={`nav-tab ${isDashboard ? "active" : ""}`}
            onClick={() => navigate("/")}
            >
                <Target size={18} />
                <span>My Challenges</span>
            </button>

            {/* leaderboard */}
            <button className={`nav-tab ${isLeaderboard ? "active" : ""}`}
            onClick={() => navigate("/leaderboard")}
            >
                <Trophy size={18} />
                <span>Leaderboard</span>
            </button>
        </div>
        </>
    );
};

