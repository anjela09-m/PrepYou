const axios = require("axios");

const generateDailyPlanWithAI = async ({
  goalTitle,
  skills = [],
  weekdayHours,
  weekendHours,
  userPrompt = "",
  sentiment = "neutral",
}) => {
  try {
    const totalHours = weekdayHours || weekendHours || 4;
    let totalMinutes = Math.round(totalHours * 60);
    // Round to nearest 5 minutes
    totalMinutes = Math.floor(totalMinutes / 5) * 5;
    if (totalMinutes < 20) totalMinutes = 20; // Minimum constraint

    const prompt = `
You are an intelligent study planner. Create a DAILY STUDY PLAN that fits EXACTLY into ${totalMinutes} minutes.

Goal: ${goalTitle}
User Sentiment: ${sentiment}
Available Time: ${totalMinutes} minutes

CRITICAL RULES:
1. The sum of all task durations MUST be EXACTLY ${totalMinutes} minutes.
2. If the user has limited time (e.g. 60 mins), generate fewer tasks (e.g. 2 tasks of 30 mins, or 40+20).
3. Do NOT generate more tasks than can fit.
4. Allowed durations: 10, 15, 20, 30, 45, 60.
5. Task descriptions MUST be concise (max 2 lines, under 180 chars).
6. Use active voice (e.g., 'Revise Chapter 1', not 'You should revise...').

Content Rules:
- Focus on practical, actionable tasks.
- Map tasks to skills: ${skills.map(s => s.name).join(", ")}.

Return ONLY a JSON array:
[
  { "skill": "Topic", "task": "Description", "priority": 1, "duration": 30 }
]
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    let tasks = parsed.map((t, i) => {
      // Enforce max length of 180 chars
      let taskDesc = t.task || "Study task";
      if (taskDesc.length > 180) {
        taskDesc = taskDesc.substring(0, 177) + "...";
      }

      return {
        skill: t.skill || "General",
        task: taskDesc,
        priority: Number(t.priority) || i + 1,
        duration: Number(t.duration) || 30,
        isCompleted: false,
      };
    });

    // --- Strict Time Adjustment Post-Processing ---
    let currentTotal = tasks.reduce((sum, t) => sum + t.duration, 0);

    // 1. Split tasks that are way too long (e.g. > 120 mins)
    let finalTasks = [];
    for (let task of tasks) {
      if (task.duration > 120) {
        const parts = Math.ceil(task.duration / 60);
        const partDuration = Math.floor(task.duration / parts / 5) * 5;
        for (let i = 0; i < parts; i++) {
          finalTasks.push({
            ...task,
            task: `${task.task} (Part ${i + 1})`,
            duration: i === parts - 1 ? task.duration - (partDuration * (parts - 1)) : partDuration
          });
        }
      } else {
        finalTasks.push(task);
      }
    }
    tasks = finalTasks;
    currentTotal = tasks.reduce((sum, t) => sum + t.duration, 0);

    // 2. If Over Budget: Trim from bottom up
    if (currentTotal > totalMinutes) {
      for (let i = tasks.length - 1; i >= 0; i--) {
        if (currentTotal <= totalMinutes) break;

        const task = tasks[i];
        const reduceBy = Math.min(task.duration - 15, currentTotal - totalMinutes); // Keep at least 15m

        if (reduceBy > 0) {
          task.duration -= reduceBy;
          currentTotal -= reduceBy;
        }
      }

      // If still over budget, remove tasks from bottom
      while (tasks.length > 1 && currentTotal > totalMinutes) {
        const removed = tasks.pop();
        currentTotal -= removed.duration;
      }

      // Final trim to exact match
      if (currentTotal > totalMinutes && tasks.length > 0) {
        const diff = currentTotal - totalMinutes;
        tasks[tasks.length - 1].duration = Math.max(15, tasks[tasks.length - 1].duration - diff);
        currentTotal = tasks.reduce((sum, t) => sum + t.duration, 0);
      }
    }

    // 3. If Under Budget: Distribute extra minutes among tasks
    if (currentTotal < totalMinutes && tasks.length > 0) {
      let diff = totalMinutes - currentTotal;
      // Add to tasks one by one in 5 min increments to keep durations clean
      let idx = 0;
      while (diff > 0) {
        tasks[idx % tasks.length].duration += 5;
        diff -= 5;
        idx++;
      }
    }

    // 4. Final Cleanup: Ensure no task is too small and all are multiples of 5
    tasks = tasks.map(t => ({
      ...t,
      duration: Math.max(15, Math.round(t.duration / 5) * 5)
    }));

    // 5. Default fallback if all tasks were removed (Rare edge case)
    if (tasks.length === 0) {
      tasks.push({
        skill: "General Prep",
        task: "Focused study session",
        priority: 1,
        duration: totalMinutes,
        isCompleted: false
      });
    }

    return tasks;

  } catch (error) {
    console.error("OpenRouter AI error (daily plan):", error.message);
    const fallbackDuration = Math.floor((weekdayHours || weekendHours || 1) * 60);
    // Ensure fallback also respects multiples of 5
    const part1 = Math.floor((fallbackDuration * 0.6) / 5) * 5 || 30;
    const part2 = fallbackDuration - part1;
    return [
      { skill: "Core Concept", task: "Study main topic fundamentals", priority: 1, duration: part1, isCompleted: false },
      { skill: "Practice", task: "Solve practice problems", priority: 2, duration: Math.max(15, part2), isCompleted: false },
    ];
  }
};

// ... (existing skills implementation) ...



// ===============================
// Generate SKILLS for a new goal
// ===============================
const generateSkillsWithAI = async ({
  target,
  preparationMode,
  level,
  deadline,
  weekdayHours,
  weekendHours,
  weakAreas = [],
  providedSkills = [],
}) => {
  try {
    const prompt = `
You are an intelligent study planner.

Generate 5 skills for a new goal.

Target: ${target}
Preparation Mode: ${preparationMode}
Level: ${level}
Deadline: ${deadline}
Weekday Hours: ${weekdayHours || 4}
Weekend Hours: ${weekendHours || 4}
Weak Areas: ${weakAreas.length ? weakAreas.join(", ") : "None"}
Provided Skills: ${providedSkills.length ? providedSkills.join(", ") : "None"}

Return ONLY JSON array like this:
[
  { "name": "Skill 1", "priority": 1 },
  { "name": "Skill 2", "priority": 2 }
]
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Ensure 5 valid skills
    const skills = parsed.map((s, i) => ({
      name: s.name || `Skill${i + 1}`,
      priority: Number(s.priority) || i + 1,
    }));

    while (skills.length < 5) {
      skills.push({ name: `ExtraSkill${skills.length + 1}`, priority: skills.length + 1 });
    }

    return skills;
  } catch (error) {
    console.error("OpenRouter AI error (skills):", error.message);

    // fallback (always 5 valid skills)
    return [
      { name: "Fundamentals", priority: 1 },
      { name: "Advanced Concepts", priority: 2 },
      { name: "Practice & Application", priority: 3 },
      { name: "Mock Tests", priority: 4 },
      { name: "Revision", priority: 5 },
    ];
  }
};

const generateSummaryPlanWithAI = async ({
  goalTitle,
  target,
  preparationMode,
  level,
  duration,
  skills,
  userPrompt = ""
}) => {
  try {
    const prompt = `
You are an expert curriculum designer and study strategist.

Create a HIGH-LEVEL SUMMARY STUDY PLAN for a user's goal.
DO NOT provide daily tasks. Provide a weekly progression and strategy.

Goal: ${goalTitle}
Target: ${target}
Mode: ${preparationMode}
Level: ${level}
Duration: ${duration}
Skills: ${JSON.stringify(skills)}
User feedback: ${userPrompt || "None"}

Return ONLY JSON in this format:
{
  "weeklyStructure": [
    { "week": 1, "focus": "Fundamentals and Core Concepts" },
    { "week": 2, "focus": "Intermediate Problems and Speed building" }
  ],
  "focusAreas": ["Data Structures", "Problem Solving Speed", "Mock Interviews"],
  "skillDistribution": [
    { "skill": "DSA", "percentage": 40 },
    { "skill": "System Design", "percentage": 30 }
  ],
  "dailyEffort": "2 hours on weekdays, 4 hours on weekends",
  "strategy": "The plan focuses on building a strong foundation in the first half followed by intensive practice and mock testing."
}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    console.log("🧠 RAW AI RESPONSE (Summary Plan):", text);

    // More aggressive cleaning to handle various AI response formats
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/"""/g, '"')  // Replace triple quotes with single quotes
      .trim();

    console.log("🧹 CLEANED RESPONSE:", cleaned);

    const parsed = JSON.parse(cleaned);
    console.log("✅ PARSED SUMMARY PLAN:", JSON.stringify(parsed, null, 2));

    // Validate that all required fields are present and not empty
    if (!parsed.weeklyStructure || !Array.isArray(parsed.weeklyStructure) || parsed.weeklyStructure.length === 0) {
      throw new Error("Invalid weeklyStructure in AI response");
    }
    if (!parsed.focusAreas || !Array.isArray(parsed.focusAreas) || parsed.focusAreas.length === 0) {
      throw new Error("Invalid focusAreas in AI response");
    }
    if (!parsed.skillDistribution || !Array.isArray(parsed.skillDistribution) || parsed.skillDistribution.length === 0) {
      throw new Error("Invalid skillDistribution in AI response");
    }
    if (!parsed.dailyEffort || typeof parsed.dailyEffort !== 'string' || parsed.dailyEffort.includes('"""')) {
      throw new Error("Invalid dailyEffort in AI response");
    }
    if (!parsed.strategy || typeof parsed.strategy !== 'string' || parsed.strategy.includes('"""')) {
      throw new Error("Invalid strategy in AI response");
    }

    return parsed;
  } catch (error) {
    console.error("OpenRouter AI error (summary plan):", error.message);
    console.error("Full error:", error);

    // Comprehensive fallback with all required fields
    return {
      weeklyStructure: [
        { week: 1, focus: "Foundation building and core concepts" },
        { week: 2, focus: "Intermediate practice and skill development" },
        { week: 3, focus: "Advanced topics and problem-solving" },
        { week: 4, focus: "Mock tests and final preparation" }
      ],
      focusAreas: ["Core Fundamentals", "Practical Application", "Speed & Accuracy"],
      skillDistribution: skills && skills.length > 0
        ? skills.slice(0, 3).map((s, i) => ({
          skill: s.name,
          percentage: i === 0 ? 40 : i === 1 ? 35 : 25
        }))
        : [
          { skill: "Primary Skill", percentage: 50 },
          { skill: "Secondary Skill", percentage: 30 },
          { skill: "Supporting Skill", percentage: 20 }
        ],
      dailyEffort: "Consistent daily practice with focused sessions",
      strategy: `A structured approach to mastering ${target || 'your goal'} through progressive learning, starting with fundamentals and advancing to complex problem-solving.`
    };
  }
};

const generatePersonalizedMotivationWithAI = async ({
  goalTitle,
  completedToday,
  totalToday,
  sentiment = "neutral"
}) => {
  try {
    const prompt = `
Generate ONE personalized motivational line for a student working on their goal: "${goalTitle}".
Progress today: ${completedToday}/${totalToday} tasks completed.
User Sentiment from Journal: ${sentiment}.

Instructions:
- If sentiment is 'stressed', be calming and reassuring.
- If sentiment is 'motivated', be high-energy.
- If they haven't started (0 tasks), be very encouraging.
- If they are half way, keep the momentum.
- If they are almost done, celebrate.

Return ONLY the text of the motivation. Keep it under 20 words.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim().replace(/^"|"$/g, '');
  } catch (error) {
    return "The secret of getting ahead is getting started. You've got this!";
  }
};

const generateSentimentWithAI = async (text) => {
  try {
    const prompt = `
Analyze the sentiment of this journal entry: "${text}"
Choose EXACTLY one: motivated, neutral, stressed, demotivated.
Return ONLY the word in lowercase.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content.toLowerCase().trim();
    if (["motivated", "neutral", "stressed", "demotivated"].includes(content)) {
      return content;
    }
    return "neutral";
  } catch (error) {
    console.error("OpenRouter AI error (sentiment):", error.message);
    return "neutral";
  }
};

module.exports = {
  generateDailyPlanWithAI,
  generateSkillsWithAI,
  generateSentimentWithAI,
  generateSummaryPlanWithAI,
  generatePersonalizedMotivationWithAI
};
