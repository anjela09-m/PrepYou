const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateDailyPlanWithAI = async ({
  goalTitle,
  skills,
  weekdayHours,
  weekendHours,
  userPrompt = "",
}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro", // ✅ FIXED MODEL
    });

    const prompt = `
You are an intelligent study planner.

Create a DAILY STUDY PLAN.

Goal: ${goalTitle}

Skills with priority:
${skills.map(s => `- ${s.name} (priority ${s.priority})`).join("\n")}

Rules:
- Higher priority → more time
- Beginner-friendly
- Tasks should be practical
- Duration in HOURS (number)
- Do NOT add explanations

User instruction:
${userPrompt || "None"}

Return ONLY JSON array:
[
  {
    "skill": "DSA",
    "task": "Practice arrays problems",
    "duration": 1
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return parsed.map(t => {
      const skillObj = skills.find(s => s.name === t.skill);

      return {
        skill: t.skill,
        task: t.task,
        duration: Number(t.duration),
        priority: skillObj ? skillObj.priority : 1, // ✅ FIXED
        isCompleted: false,
      };
    });
  } catch (error) {
    console.error("Gemini AI error:", error.message);

    // 🔁 FALLBACK (important for demo & free tier)
    return skills.map(skill => ({
      skill: skill.name,
      task: `Revise basics of ${skill.name}`,
      duration: 1,
      priority: skill.priority, // ✅ FIXED
      isCompleted: false,
    }));
  }
};

module.exports = { generateDailyPlanWithAI };
