import { db } from "@db";
import { questions, answers, users, specialties, resources, attempts, userStats, activityLog } from "@shared/schema";
import { eq, and, desc, gte, lte, count, avg, sql } from "drizzle-orm";

export const storage = {
  // Question Management
  async createQuestion(data: any) {
    const [newQuestion] = await db.insert(questions).values(data).returning();
    return newQuestion;
  },

  async getQuestionById(id: string) {
    return await db.query.questions.findFirst({
      where: eq(questions.id, id)
    });
  },

  async getSpecialties() {
    return await db.query.specialties.findMany();
  },

  async createSpecialty(data: any) {
    const [newSpecialty] = await db.insert(specialties).values(data).returning();
    return newSpecialty;
  },

  // Answer and Attempts Management
  async saveAnswer(data: any) {
    const [newAnswer] = await db.insert(answers).values(data).returning();
    return newAnswer;
  },

  async saveAttempt(data: any) {
    const [newAttempt] = await db.insert(attempts).values(data).returning();
    return newAttempt;
  },

  async getAnswerByQuestionAndUser(questionId: string, userId: number) {
    return await db.query.answers.findFirst({
      where: and(
        eq(answers.questionId, questionId),
        eq(answers.userId, userId)
      )
    });
  },

  // User Stats
  async getUserStats(userId: number) {
    return await db.query.userStats.findFirst({
      where: eq(userStats.userId, userId)
    });
  },

  async updateUserStats(userId: number, data: any) {
    const [updated] = await db.update(userStats)
      .set(data)
      .where(eq(userStats.userId, userId))
      .returning();
    return updated;
  },

  // Activity Logging
  async logActivity(data: any) {
    const [newActivity] = await db.insert(activityLog).values(data).returning();
    return newActivity;
  },

  async getRecentActivity(userId: number, limit = 10) {
    return await db.query.activityLog.findMany({
      where: eq(activityLog.userId, userId),
      orderBy: [desc(activityLog.createdAt)],
      limit
    });
  },

  // Performance Analytics
  async getPerformanceBySpecialty(userId: number) {
    const result = await db.select({
      specialtyId: specialties.id,
      name: specialties.name,
      questions: count(),
      accuracy: avg(attempts.score)
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .innerJoin(specialties, eq(questions.specialtyId, specialties.id))
    .where(eq(attempts.userId, userId))
    .groupBy(specialties.id, specialties.name)
    .orderBy(desc(avg(attempts.score)));

    return result;
  },

  async getPerformanceByDifficulty(userId: number) {
    const result = await db.select({
      difficulty: questions.difficulty,
      questions: count(),
      accuracy: avg(attempts.score)
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.userId, userId))
    .groupBy(questions.difficulty)
    .orderBy(questions.difficulty);

    return result;
  },

  async getProgressOverTime(userId: number, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db.select({
      date: sql<string>`DATE(${attempts.createdAt})`,
      questionsAttempted: count(),
      accuracy: avg(attempts.score)
    })
    .from(attempts)
    .where(and(
      eq(attempts.userId, userId),
      gte(attempts.createdAt, startDate)
    ))
    .groupBy(sql`DATE(${attempts.createdAt})`)
    .orderBy(sql`DATE(${attempts.createdAt})`);

    return result;
  },

  async getWeeklyActivity(userId: number) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const result = await db.select({
      day: sql<string>`to_char(${activityLog.createdAt}, 'Day')`,
      questions: count(activityLog.id),
      minutes: sql<number>`sum(CASE WHEN ${activityLog.type} = 'practice' THEN ${activityLog.duration} ELSE 0 END)`,
    })
    .from(activityLog)
    .where(and(
      eq(activityLog.userId, userId),
      gte(activityLog.createdAt, startDate)
    ))
    .groupBy(sql`to_char(${activityLog.createdAt}, 'Day')`)
    .orderBy(sql`CASE to_char(${activityLog.createdAt}, 'Day') 
      WHEN 'Sunday   ' THEN 0
      WHEN 'Monday   ' THEN 1
      WHEN 'Tuesday  ' THEN 2
      WHEN 'Wednesday' THEN 3
      WHEN 'Thursday ' THEN 4
      WHEN 'Friday   ' THEN 5
      WHEN 'Saturday ' THEN 6
    END`);

    // Fill in missing days
    const activityMap = new Map(result.map(item => {
      const day = item.day.trim();
      return [day, item];
    }));

    const completeData = daysOfWeek.map(day => {
      if (activityMap.has(day)) {
        const data = activityMap.get(day)!;
        return {
          day,
          questions: data.questions,
          minutes: data.minutes
        };
      }
      return { day, questions: 0, minutes: 0 };
    });

    return completeData;
  },

  // Resources
  async getResources(type: string) {
    return await db.query.resources.findMany({
      where: eq(resources.type, type)
    });
  }
};
