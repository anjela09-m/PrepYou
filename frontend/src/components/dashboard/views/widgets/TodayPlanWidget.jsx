import React, { useState } from "react";
import { completeTask } from "../../../../api/planApi";

const TodayPlanWidget = ({ plan, onUpdate, fullWidth }) => {
    const [optimisticTasks, setOptimisticTasks] = useState(null);

    React.useEffect(() => {
        if (plan?.tasks) {
            setOptimisticTasks(plan.tasks);
        }
    }, [plan?.tasks]);

    const handleToggleTask = async (taskId) => {
        if (!plan) return;

        const previousTasks = [...optimisticTasks];
        const newTasks = optimisticTasks.map(t =>
            t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        setOptimisticTasks(newTasks);

        try {
            await completeTask(plan._id, taskId);
            onUpdate();
        } catch (error) {
            setOptimisticTasks(previousTasks);
            alert("Failed to update task status");
        }
    };

    if (!plan) return <div className="widget-card">No plan for today</div>;

    const displayTasks = optimisticTasks || plan.tasks || [];
    const completedCount = displayTasks.filter(t => t.isCompleted).length;
    const progressPercent = displayTasks.length > 0 ? Math.round((completedCount / displayTasks.length) * 100) : 0;

    return (
        <div className={`widget-card task-widget ${fullWidth ? "full-width" : ""}`}>
            <div className="widget-header">
                <h3>Today's Focus</h3>
                <span className="progress-badge">{progressPercent}% Done</span>
            </div>
            <div className="task-list">
                {displayTasks.map((task) => (
                    <div key={task._id} className={`task-item ${task.isCompleted ? "completed" : ""}`}>
                        <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => handleToggleTask(task._id)}
                        />
                        <div className="task-details">
                            <p className="task-title">{task.task}</p>
                            <span className="task-meta">{task.skill} • {task.duration} mins</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodayPlanWidget;
