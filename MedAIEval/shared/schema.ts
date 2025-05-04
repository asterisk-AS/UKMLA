import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const difficultyEnum = pgEnum('difficulty', ['Foundation', 'Intermediate', 'Advanced', 'UKMLA']);
export const activityTypeEnum = pgEnum('activity_type', ['answer', 'practice', 'review', 'achievement', 'gap']);
export const resourceTypeEnum = pgEnum('resource_type', ['guideline', 'questionbank', 'ukmla', 'other']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Specialties
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  questionCount: integer("question_count").default(0),
  colorClass: text("color_class"),
  bgClass: text("bg_class"),
  textClass: text("text_class"),
  masteryPercentage: integer("mastery_percentage").default(0)
});

export const insertSpecialtySchema = createInsertSchema(specialties).pick({
  name: true,
  description: true,
  questionCount: true,
  colorClass: true,
  bgClass: true,
  textClass: true,
  masteryPercentage: true
});

export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;
export type Specialty = typeof specialties.$inferSelect;

// Questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  specialtyId: integer("specialty_id").references(() => specialties.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  difficulty: text("difficulty").notNull(),
  scenario: text("scenario").notNull(),
  question: text("question").notNull(),
  modelAnswer: text("model_answer").notNull(),
  strengths: jsonb("strengths").notNull(),
  areasForImprovement: jsonb("areas_for_improvement").notNull(),
  learningPoints: jsonb("learning_points").notNull(),
  relatedResources: jsonb("related_resources"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  specialtyId: true,
  userId: true,
  difficulty: true,
  scenario: true,
  question: true,
  modelAnswer: true,
  strengths: true,
  areasForImprovement: true,
  learningPoints: true,
  relatedResources: true
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Answers
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  answer: text("answer").notNull(),
  evaluation: jsonb("evaluation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  questionId: true,
  userId: true,
  answer: true,
  evaluation: true
});

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;

// Attempts
export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertAttemptSchema = createInsertSchema(attempts).pick({
  questionId: true,
  userId: true,
  score: true
});

export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attempts.$inferSelect;

// User Stats
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  questionsAnswered: integer("questions_answered").default(0),
  accuracyRate: integer("accuracy_rate").default(0),
  questionsWeeklyChange: integer("questions_weekly_change").default(0),
  accuracyWeeklyChange: integer("accuracy_weekly_change").default(0),
  strongestArea: text("strongest_area"),
  strongestAreaAccuracy: integer("strongest_area_accuracy").default(0),
  weakestArea: text("weakest_area"),
  weakestAreaAccuracy: integer("weakest_area_accuracy").default(0),
  activeDays: integer("active_days").default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
  questionsAnswered: true,
  accuracyRate: true,
  questionsWeeklyChange: true,
  accuracyWeeklyChange: true,
  strongestArea: true,
  strongestAreaAccuracy: true,
  weakestArea: true,
  weakestAreaAccuracy: true,
  activeDays: true
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Activity Log
export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertActivityLogSchema = createInsertSchema(activityLog).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  duration: true
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLog.$inferSelect;

// Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  organization: text("organization"),
  platform: text("platform"),
  free: boolean("free"),
  hasDemo: boolean("has_demo"),
  demoUrl: text("demo_url"),
  publisher: text("publisher"),
  date: text("date"),
  questionCount: integer("question_count"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  type: true,
  title: true,
  description: true,
  url: true,
  organization: true,
  platform: true,
  free: true,
  hasDemo: true,
  demoUrl: true,
  publisher: true,
  date: true,
  questionCount: true,
  tags: true
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questions: many(questions),
  answers: many(answers),
  attempts: many(attempts),
  stats: many(userStats),
  activities: many(activityLog)
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  questions: many(questions)
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [questions.specialtyId],
    references: [specialties.id]
  }),
  user: one(users, {
    fields: [questions.userId],
    references: [users.id]
  }),
  answers: many(answers),
  attempts: many(attempts)
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id]
  }),
  user: one(users, {
    fields: [answers.userId],
    references: [users.id]
  })
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  question: one(questions, {
    fields: [attempts.questionId],
    references: [questions.id]
  }),
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id]
  })
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id]
  })
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id]
  })
}));
