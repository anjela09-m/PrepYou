import React, { useState } from "react";
import "./CreateGoal.css";
import { createGoal } from "../api/goalApi";

const CreateGoal = ({ onGoalCreated }) => {
    const [formData, setFormData] = useState({
        title: "",
        target: "Job/Exam",
        level: "Beginner",
        weekdayHours: 3,
        weekendHours: 5,
        deadline: "",
        preparationMode: "placement", // Default
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = { ...formData };
            if (payload.skillsInput) {
                payload.skills = payload.skillsInput.split(",").map(skill => ({
                    name: skill.trim(),
                    priority: 0 // priorities assigned by AI if not user provided. Or we could prompt for priority.
                })).filter(s => s.name);
            }
            await createGoal(payload);
            alert("Goal created! Generating your plan...");
            if (onGoalCreated) onGoalCreated();
        } catch (error) {
            console.error(error);
            alert("Failed to create goal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-goal-container">
            <h2>Create Your Study Goal</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Goal Title (e.g., "Crack Google Interview")</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="What do you want to achieve?"
                    />
                </div>

                <div className="form-group">
                    <label>Preparation Mode</label>
                    <select
                        name="preparationMode"
                        value={formData.preparationMode}
                        onChange={handleChange}
                    >
                        <option value="placement">Placement Prep</option>
                        <option value="competitive">Competitive Programming</option>
                        <option value="skill-switch">Skill Switch</option>
                        <option value="interview">Interview Prep</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Specific Skills (Optional, comma separated)</label>
                    <input
                        type="text"
                        name="skillsInput"
                        value={formData.skillsInput || ""}
                        onChange={handleChange}
                        placeholder="e.g. React, Node.js, Python (Leave empty for AI)"
                    />
                </div>

                <div className="form-group">
                    <label>Current Level</label>
                    <select name="level" value={formData.level} onChange={handleChange}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Deadline</label>
                    <input
                        type="date"
                        name="deadline"
                        required
                        value={formData.deadline}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Weekday Study Hours</label>
                    <input
                        type="number"
                        name="weekdayHours"
                        min="1"
                        max="24"
                        value={formData.weekdayHours}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Weekend Study Hours</label>
                    <input
                        type="number"
                        name="weekendHours"
                        min="1"
                        max="24"
                        value={formData.weekendHours}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn-create" disabled={loading}>
                    {loading ? "Creating Goal..." : "Create Goal & Generate Plan 🚀"}
                </button>
            </form>
        </div>
    );
};

export default CreateGoal;
