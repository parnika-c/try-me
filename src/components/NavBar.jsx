import React from "react";
import { Target, Compass, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavBar.css";

export const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === "/";
    const isLeaderboard = location.pathname === "/leaderboard";
    return (
        <>
        <nav className="navbar">
            <div className="nav-left">
                <div className="logo-section">
                    <span className="trophy">🏆</span>
                    <div className="text-group">
                        <h1 className="app-name">Try Me</h1>
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
                </div>
                    <img className="profile-pic" src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" alt="Profile Picture"/>
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

            {/*discover*/}
            <button
            className="nav-tab"
            onClick={() => navigate("/")}
            >
            <Compass size={18} />
            <span>Discover</span>
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
        </>
    );
};

