import React, { useEffect, useState } from "react";
import { Target, Compass, Trophy } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../services/api.js";
import { fetchUsers } from "./LeaderboardLogic.jsx";
import "./NavBar.css";

export const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === "/";
    const isLeaderboard = location.pathname === "/leaderboard";

    const [rank, setRank] = useState('#--');
    const [points, setPoints] = useState('-- pts');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const currentUser = await getCurrentUser();
                const allUsers = await fetchUsers();
                const sortedUsers = allUsers.sort((a, b) => b.totalPoints - a.totalPoints);
                const userRank = sortedUsers.findIndex(u => u.id === currentUser._id) + 1;
                setRank(`#${userRank}`);
                setPoints(`${currentUser.totalPoints} pts`);
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
                        <h1 className="app-name">Try Me</h1>
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

