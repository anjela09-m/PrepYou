import React, { useState } from "react";
import { createGoal } from "../api/goalApi";

const Goals = ({ onGoalCreated }) => {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [preparationMode, setPreparationMode] = useState("placement");
  const [skills, setSkills] = useState(""); // comma-separated optional
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert skills input to array if provided
      const skillArray = skills
        ? skills.split(",").map((s) => s.trim())
        : [];

      const goalData = {
        title,
        target,
        preparationMode,
        skills: skillArray,
      };

      const res = await createGoal(goalData);

      // Callback to parent (maybe Dashboard or App) to refresh plans
      if (onGoalCreated) onGoalCreated(res.data);

      // Clear form
      setTitle("");
      setTarget("");
      setPreparationMode("placement");
      setSkills("");
      alert("Goal created successfully!");
    } catch (err) {
      console.error("Error creating goal", err);
      alert("Failed to create goal. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create New Goal</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Goal Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Target (Exam/Company):</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Preparation Mode:</label>
          <select
            value={preparationMode}
            onChange={(e) => setPreparationMode(e.target.value)}
          >
            <option value="placement">Placement</option>
            <option value="exam">Exam</option>
            <option value="course">Course</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Skills / Topics (optional, comma separated):</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., DSA, React, SQL"
          />
          <small>
            Leave empty to let AI suggest skills & priority automatically.
          </small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Goal"}
        </button>
      </form>
    </div>
  );
};

export default Goals;
