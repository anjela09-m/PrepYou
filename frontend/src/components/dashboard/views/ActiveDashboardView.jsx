import React from "react";
import TodayPlanWidget from "./widgets/TodayPlanWidget";
import ProgressWidget from "./widgets/ProgressWidget";
import PendingTasksWidget from "./widgets/PendingTasksWidget";
import "./Views.css";

const ActiveDashboardView = ({ activeView, goal, plan, onUpdate }) => {
    const renderView = () => {
        switch (activeView) {
            case "dashboard":
                return (
                    <div className="dashboard-grid">
                        <TodayPlanWidget plan={plan} onUpdate={onUpdate} />
                        <ProgressWidget goal={goal} />
                        <PendingTasksWidget />
                    </div>
                );
            case "today-plan":
                return <TodayPlanWidget plan={plan} onUpdate={onUpdate} fullWidth />;
            case "pending-tasks":
                return <PendingTasksWidget fullWidth />;
            case "progress":
                return <ProgressWidget goal={goal} fullWidth />;
            default:
                return <div>View not found</div>;
        }
    };

    return <div className="active-dashboard-state">{renderView()}</div>;
};

export default ActiveDashboardView;
