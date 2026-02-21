import React from "react";

const PendingTasksWidget = ({ fullWidth }) => {
    // In a real app, this would fetch tasks from the backend where status is carried forward
    const mockPendingTasks = [
        { id: 1, task: "Complete Linked List exercises", skill: "Data Structures" },
        { id: 2, task: "Revise HTTP methods", skill: "Networking" }
    ];

    return (
        <div className={`widget-card pending-widget ${fullWidth ? "full-width" : ""}`}>
            <h3>Pending Tasks</h3>
            <p className="widget-subtitle">From previous days</p>
            <div className="task-list">
                {mockPendingTasks.length > 0 ? (
                    mockPendingTasks.map((task) => (
                        <div key={task.id} className="task-item pending">
                            <div className="task-details">
                                <p className="task-title">{task.task}</p>
                                <span className="task-meta">{task.skill}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">All caught up! 🎉</div>
                )}
            </div>
        </div>
    );
};

export default PendingTasksWidget;
