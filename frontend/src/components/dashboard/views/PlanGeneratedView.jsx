import React, { useState } from "react";
import { acceptPlan, regeneratePlan } from "../../../api/planApi";
import "./Views.css";

const PlanGeneratedView = ({ plan, onPlanUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");

    const handleAccept = async () => {
        setLoading(true);
        try {
            await acceptPlan();
            onPlanUpdate();
        } catch (error) {
            alert("Failed to accept plan");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        try {
            await regeneratePlan(prompt);
            onPlanUpdate();
            setPrompt("");
        } catch (error) {
            alert("Failed to regenerate plan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="plan-generated-view">
            <div className="plan-card">
                <h2>Your Study Plan is Ready!</h2>
                <p>Review your plan for today. You can regenerate it with feedback if needed.</p>

                <div className="task-preview-list">
                    {plan.tasks.map((task, index) => (
                        <div key={index} className="task-preview-item">
                            <span className="task-skill">{task.skill}</span>
                            <span className="task-desc">{task.task}</span>
                            <span className="task-time">{task.duration} mins</span>
                        </div>
                    ))}
                </div>

                <div className="regeneration-box">
                    <textarea
                        placeholder="Any specific focus for today? (Optional)"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button onClick={handleRegenerate} disabled={loading} className="secondary-btn">
                        Regenerate Plan
                    </button>
                </div>

                <div className="action-buttons">
                    <button onClick={handleAccept} disabled={loading} className="primary-btn">
                        {loading ? "Accepting..." : "Accept & Start Preparation"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanGeneratedView;
