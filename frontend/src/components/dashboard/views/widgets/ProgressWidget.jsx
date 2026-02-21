import React, { useState, useEffect } from "react";
import { getProgress } from "../../../../api/progressApi";

const ProgressWidget = ({ goal, fullWidth }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const res = await getProgress();
                setStats(res.data.progress);
            } catch (error) {
                console.error("Failed to fetch progress stats");
            }
        };
        fetchProgress();
    }, [goal]);

    return (
        <div className={`widget-card stats-widget ${fullWidth ? "full-width" : ""}`}>
            <h3>Preparation Progress</h3>
            <div className="stats-grid">
                <div className="stat-item">
                    <label>Overall Progress</label>
                    <div className="stat-value">{stats?.completionRate || 0}%</div>
                </div>
                <div className="stat-item">
                    <label>Study Streak</label>
                    <div className="stat-value">🔥 {stats?.streak || 0} Days</div>
                </div>
                <div className="stat-item">
                    <label>Current Goal</label>
                    <p>{goal.title}</p>
                </div>
            </div>
        </div>
    );
};

export default ProgressWidget;
