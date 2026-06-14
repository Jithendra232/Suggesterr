import Project from "../models/Project.js";

export async function getAnalytics(userId) {
  const totalProjects = await Project.countDocuments({ userId });
  const geminiGenerated = await Project.countDocuments({ userId, source: "gemini" });
  const templateGenerated = await Project.countDocuments({ userId, source: "template" });

  // Most used domains (top 10)
  const domainAgg = await Project.aggregate([
    { $match: { userId } },
    { $group: { _id: "$domain", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, name: "$_id", count: 1 } }
  ]);

  // Most used skills (top 15)
  const skillAgg = await Project.aggregate([
    { $match: { userId } },
    { $unwind: "$skills" },
    { $group: { _id: "$skills", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
    { $project: { _id: 0, name: "$_id", count: 1 } }
  ]);

  // Difficulty distribution
  const difficultyAgg = await Project.aggregate([
    { $match: { userId } },
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    { $project: { _id: 0, name: "$_id", count: 1 } }
  ]);

  // Monthly trend (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAgg = await Project.aggregate([
    { $match: { userId, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthlyTrend = monthlyAgg.map((m) => {
    const date = new Date(m._id.year, m._id.month - 1);
    return {
      name: date.toLocaleString("default", { month: "short", year: "2-digit" }),
      count: m.count
    };
  });

  // Weekly trend (last 12 weeks)
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  twelveWeeksAgo.setHours(0, 0, 0, 0);

  const weeklyAgg = await Project.aggregate([
    { $match: { userId, createdAt: { $gte: twelveWeeksAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } }
  ]);

  const weeklyTrend = weeklyAgg.map((w, idx) => ({
    name: `W${idx + 1}`,
    count: w.count
  }));

  return {
    totalProjects,
    geminiGenerated,
    templateGenerated,
    mostUsedDomains: domainAgg,
    mostUsedSkills: skillAgg,
    difficultyDistribution: difficultyAgg,
    monthlyTrend,
    weeklyTrend
  };
}
