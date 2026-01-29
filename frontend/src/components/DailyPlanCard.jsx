import React from "react";

const DailyPlanCard = ({ task, onComplete, onDelete }) => {
  const cardStyle = {
    border: "1px solid #ccc",
    padding: 12,
    marginBottom: 10,
    backgroundColor: task.completed ? "#f0f0f0" : "#fff",
    textDecoration: task.completed ? "line-through" : "none",
    opacity: task.completed ? 0.7 : 1,
  };

  return (
    <div style={cardStyle}>
      <h4>{task.skill}</h4>
      <p>Duration: {task.duration} hr</p>
      <p>Status: {task.completed ? "✅ Completed" : "❌ Pending"}</p>

      <div style={{ marginTop: 8 }}>
        {!task.completed && (
          <button onClick={onComplete} style={{ marginRight: 10 }}>
            Mark Done
          </button>
        )}
        <button onClick={onDelete} style={{ color: "red" }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default DailyPlanCard;