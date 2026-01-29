import React, { useEffect, useState } from "react";
import { 
  getTodayPlan, 
  completeTask, 
  completeAllTasks, 
  deleteTask, 
  regeneratePlan 
} from "../api/planApi";
import DailyPlanCard from "../components/DailyPlanCard";

const Dashboard = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  // Fetch today's plan from backend (AI-generated)
  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await getTodayPlan();
      setPlan(res.data);
    } catch (err) {
      console.error("Error fetching plan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  // Complete a single task
  const handleComplete = async (taskId) => {
    try {
      await completeTask(plan._id, taskId);
      setPlan(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t._id === taskId ? { ...t, completed: true } : t)
      }));
    } catch (err) {
      console.error("Error completing task", err);
    }
  };

  // Delete a task
  const handleDelete = async (taskId) => {
    try {
      await deleteTask(plan._id, taskId);
      setPlan(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t._id !== taskId)
      }));
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  // Complete all tasks
  const handleCompleteAll = async () => {
    try {
      await completeAllTasks(plan._id);
      setPlan(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => ({ ...t, completed: true }))
      }));
    } catch (err) {
      console.error("Error completing all tasks", err);
    }
  };

  // Regenerate plan (optional prompt)
  const handleRegenerate = async (prompt = "") => {
    try {
      setRegenerating(true);
      const res = await regeneratePlan(plan._id, prompt);
      setPlan(res.data);
    } catch (err) {
      console.error("Error regenerating plan", err);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!plan) return <p>No plan for today</p>;

  const completedCount = plan.tasks.filter(t => t.completed).length;
  const totalCount = plan.tasks.length;

  return (
    <div style={{ padding: 20 }}>
      <h2>Today's Plan</h2>

      <p>Progress: {completedCount}/{totalCount} tasks completed</p>

      <div style={{ marginBottom: 15 }}>
        <button onClick={handleCompleteAll} style={{ marginRight: 10 }}>
          Complete All Tasks
        </button>
        <button 
          onClick={() => handleRegenerate("Adjust plan based on pending tasks")} 
          disabled={regenerating}
        >
          {regenerating ? "Regenerating..." : "Regenerate Plan"}
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {plan.tasks.map((task) => (
          <DailyPlanCard
            key={task._id}
            task={task}
            onComplete={() => handleComplete(task._id)}
            onDelete={() => handleDelete(task._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
