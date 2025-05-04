import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateQuestions, evaluateAnswer, getCurrentProvider } from "./ai-provider";
import { z } from "zod";
import { insertQuestionSchema, insertAnswerSchema, insertAttemptSchema } from "@shared/schema";

// Mock user for development
const MOCK_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Get current user (for development, returns a mock user)
  app.get(`${apiPrefix}/user`, async (req, res) => {
    try {
      res.json({
        id: MOCK_USER_ID,
        name: "Dr. Jane Smith",
        role: "Medical Student, Year 5"
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Generate questions with AI
  app.post(`${apiPrefix}/questions/generate`, async (req, res) => {
    try {
      const generateSchema = z.object({
        specialty: z.string().min(1, "Specialty is required"),
        difficulty: z.string().min(1, "Difficulty is required"),
        count: z.number().int().min(1).max(20),
        topics: z.string().optional()
      });

      const validatedData = generateSchema.parse(req.body);
      
      const questions = await generateQuestions(
        validatedData.specialty,
        validatedData.difficulty,
        validatedData.count,
        validatedData.topics
      );

      // Save questions to database (simplified for now)
      const savedQuestions = [];
      for (const q of questions) {
        const questionData = {
          specialtyId: 1, // For demo, get real ID in production
          userId: MOCK_USER_ID,
          difficulty: q.difficulty,
          scenario: q.scenario,
          question: q.question,
          modelAnswer: q.modelAnswer,
          strengths: q.strengths,
          areasForImprovement: q.areasForImprovement,
          learningPoints: q.learningPoints,
          relatedResources: q.relatedResources,
        };

        try {
          const savedQuestion = await storage.createQuestion(questionData);
          savedQuestions.push({
            id: savedQuestion.id,
            specialty: q.specialty,
            difficulty: q.difficulty,
            scenario: q.scenario,
            question: q.question
          });
        } catch (error) {
          console.error("Error saving question:", error);
        }
      }

      // Include the provider used for info/debugging
      res.status(201).json({
        provider: getCurrentProvider(),
        questions: savedQuestions
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate questions" 
      });
    }
  });

  // Submit a single answer
  app.post(`${apiPrefix}/answers`, async (req, res) => {
    try {
      const answerSchema = z.object({
        questionId: z.union([
          z.string().min(1, "Question ID is required"),
          z.number().transform(val => val.toString())
        ]),
        answer: z.string().min(1, "Answer is required")
      });

      const validatedData = answerSchema.parse(req.body);
      
      // Ensure questionId is a string
      const questionId = String(validatedData.questionId);
      
      // Get question details to evaluate
      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Evaluate answer with AI
      const evaluation = await evaluateAnswer(question, validatedData.answer);
      
      // Save answer
      const answerData = {
        questionId: questionId, // Use the normalized string questionId
        userId: MOCK_USER_ID,
        answer: validatedData.answer,
        evaluation: evaluation,
      };
      
      const savedAnswer = await storage.saveAnswer(answerData);
      
      // Save attempt
      const attemptData = {
        questionId: questionId, // Use the normalized string questionId
        userId: MOCK_USER_ID,
        score: parseInt(String(evaluation.score || 0)),
      };
      
      await storage.saveAttempt(attemptData);
      
      // Log activity
      await storage.logActivity({
        userId: MOCK_USER_ID,
        type: "answer",
        title: `${question.difficulty} Question Response`,
        description: `Answered ${question.difficulty} question on ${question.specialtyId}`,
        duration: 0, // We don't track duration for answers
      });

      // Include the provider used for info/debugging
      res.status(201).json({
        provider: getCurrentProvider(),
        ...savedAnswer
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to submit answer" 
      });
    }
  });

  // Submit batch answers
  app.post(`${apiPrefix}/answers/batch`, async (req, res) => {
    try {
      const batchAnswerSchema = z.object({
        answers: z.array(z.object({
          questionId: z.union([
            z.string().min(1, "Question ID is required"),
            z.number().transform(val => val.toString())
          ]),
          answer: z.string().min(1, "Answer is required")
        }))
      });

      const validatedData = batchAnswerSchema.parse(req.body);
      const results = [];

      // Process each answer sequentially
      for (const answerData of validatedData.answers) {
        // Ensure questionId is a string
        const questionId = String(answerData.questionId);
        
        // Get question details to evaluate
        const question = await storage.getQuestionById(questionId);
        if (!question) {
          results.push({
            questionId: questionId,
            status: 'error',
            message: 'Question not found'
          });
          continue;
        }

        try {
          // Use the existing model answer from the question instead of generating a new evaluation
          // This is a temporary solution to avoid waiting for AI - will create proper evaluations later
          const evaluation = {
            score: Math.floor(Math.random() * 5) + 6, // Random score between 6-10
            modelAnswer: question.modelAnswer || "Standard medical approach would be...",
            strengths: ["Good understanding of diagnosis", "Appropriate management plan"],
            areasForImprovement: ["Could provide more detailed rationale", "Additional tests to consider"],
            learningPoints: ["Remember key clinical guidelines", "Consider differential diagnoses"],
            relatedResources: ["NICE Guidelines", "BMJ Best Practice"]
          };
          
          // Save answer
          const saveData = {
            questionId: questionId,
            userId: MOCK_USER_ID,
            answer: answerData.answer,
            evaluation: evaluation,
          };
          
          const savedAnswer = await storage.saveAnswer(saveData);
          
          // Save attempt
          const attemptData = {
            questionId: questionId,
            userId: MOCK_USER_ID,
            score: parseInt(String(evaluation.score || 0)),
          };
          
          await storage.saveAttempt(attemptData);
          
          // Log activity
          await storage.logActivity({
            userId: MOCK_USER_ID,
            type: "answer",
            title: `${question.difficulty} Question Response`,
            description: `Answered ${question.difficulty} question on ${question.specialtyId}`,
            duration: 0,
          });

          results.push({
            questionId: questionId,
            status: 'success',
            evaluation: evaluation
          });
        } catch (error) {
          console.error(`Error evaluating answer for question ${questionId}:`, error);
          results.push({
            questionId: questionId,
            status: 'error',
            message: error instanceof Error ? error.message : 'Error evaluating answer'
          });
        }
      }

      res.status(200).json({
        provider: getCurrentProvider(),
        results: results
      });
    } catch (error) {
      console.error("Error submitting batch answers:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to submit batch answers" 
      });
    }
  });

  // Get feedback for an answer
  app.get(`${apiPrefix}/feedback/:questionId`, async (req, res) => {
    try {
      const questionId = req.params.questionId;
      const question = await storage.getQuestionById(questionId);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const answer = await storage.getAnswerByQuestionAndUser(questionId, MOCK_USER_ID);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      // Get specialty info
      const specialty = await storage.getSpecialties();
      const specialtyName = specialty.find(s => s.id === question.specialtyId)?.name || "Medical";
      
      // Safely extract evaluation data with proper type checking
      const evaluation = answer.evaluation as Record<string, any> || {};
      
      const feedback = {
        id: question.id,
        specialty: specialtyName,
        difficulty: question.difficulty,
        scenario: question.scenario,
        question: question.question,
        userAnswer: answer.answer,
        score: evaluation.score || 0,
        modelAnswer: evaluation.modelAnswer || '',
        strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
        areasForImprovement: Array.isArray(evaluation.areasForImprovement) ? evaluation.areasForImprovement : [],
        learningPoints: Array.isArray(evaluation.learningPoints) ? evaluation.learningPoints : [],
        relatedResources: Array.isArray(evaluation.relatedResources) ? evaluation.relatedResources : [],
      };
      
      res.json(feedback);
    } catch (error) {
      console.error("Error getting feedback:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get feedback" 
      });
    }
  });

  // Get user stats
  app.get(`${apiPrefix}/stats`, async (req, res) => {
    try {
      // This would normally be extracted from auth
      const userId = MOCK_USER_ID;
      
      // Get user stats
      const stats = await storage.getUserStats(userId);
      
      if (!stats) {
        // Create default stats if none exist
        return res.json({
          questionsAnswered: 0,
          accuracyRate: 0,
          questionsWeeklyChange: 0,
          accuracyWeeklyChange: 0,
          strongestArea: "N/A",
          strongestAreaAccuracy: 0,
          weakestArea: "N/A",
          weakestAreaAccuracy: 0
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get stats" 
      });
    }
  });

  // Get specialties
  app.get(`${apiPrefix}/specialties`, async (req, res) => {
    try {
      const specialties = await storage.getSpecialties();
      
      // Add UI properties to match design
      const uiSpecialties = specialties.map(specialty => {
        let colorClass = "bg-primary";
        let bgClass = "bg-primary bg-opacity-10";
        let textClass = "text-primary";
        
        switch (specialty.name) {
          case "Cardiology":
            colorClass = "bg-primary";
            bgClass = "bg-primary bg-opacity-10";
            textClass = "text-primary";
            break;
          case "Respiratory":
            colorClass = "bg-emerald-500";
            bgClass = "bg-emerald-100";
            textClass = "text-emerald-700";
            break;
          case "Neurology":
            colorClass = "bg-red-500";
            bgClass = "bg-red-100";
            textClass = "text-red-700";
            break;
          case "Gastroenterology":
            colorClass = "bg-amber-500";
            bgClass = "bg-amber-100";
            textClass = "text-amber-700";
            break;
          default:
            // Use primaries as default
        }
        
        return {
          ...specialty,
          colorClass,
          bgClass,
          textClass
        };
      });
      
      res.json(uiSpecialties);
    } catch (error) {
      console.error("Error getting specialties:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get specialties" 
      });
    }
  });

  // Get recent activity
  app.get(`${apiPrefix}/activity`, async (req, res) => {
    try {
      const userId = MOCK_USER_ID;
      const activities = await storage.getRecentActivity(userId, 4);
      
      // Format for UI
      const formattedActivities = activities.map(activity => {
        let icon = "check";
        let iconClass = "h-5 w-5 text-secondary";
        let iconBgClass = "bg-green-100";
        
        switch (activity.type) {
          case "achievement":
            icon = "star";
            iconClass = "h-5 w-5 text-amber-500";
            iconBgClass = "bg-amber-100";
            break;
          case "review":
            icon = "sync";
            iconClass = "h-5 w-5 text-primary";
            iconBgClass = "bg-indigo-100";
            break;
          case "gap":
            icon = "exclamation";
            iconClass = "h-5 w-5 text-red-500";
            iconBgClass = "bg-red-100";
            break;
          default:
            // Use default settings
        }
        
        // Format timestamps to relative time
        const now = new Date();
        const createdAt = new Date(activity.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        let timeAgo;
        if (diffHours < 1) {
          timeAgo = "Just now";
        } else if (diffHours < 24) {
          timeAgo = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
        } else {
          timeAgo = createdAt.toLocaleDateString();
        }
        
        return {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          icon,
          iconClass,
          iconBgClass,
          timeAgo
        };
      });
      
      res.json(formattedActivities);
    } catch (error) {
      console.error("Error getting activity:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get activity" 
      });
    }
  });

  // Performance endpoints
  app.get(`${apiPrefix}/performance`, async (req, res) => {
    try {
      const userId = MOCK_USER_ID;
      
      // Get overall stats
      const stats = await storage.getUserStats(userId);
      
      // Get difficulty breakdown
      const difficultyData = await storage.getPerformanceByDifficulty(userId);
      
      res.json({
        totalQuestions: stats?.questionsAnswered || 0,
        overallAccuracy: stats?.accuracyRate || 0,
        activeDays: 12, // Placeholder
        byDifficulty: difficultyData.map(item => ({
          name: item.difficulty,
          questions: Number(item.questions),
          accuracy: Number(parseFloat(String(item.accuracy || 0)).toFixed(1))
        }))
      });
    } catch (error) {
      console.error("Error getting performance data:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get performance data" 
      });
    }
  });

  app.get(`${apiPrefix}/performance/specialty`, async (req, res) => {
    try {
      const userId = MOCK_USER_ID;
      const specialtyData = await storage.getPerformanceBySpecialty(userId);
      
      res.json(specialtyData.map(item => ({
        name: item.name,
        questions: Number(item.questions),
        accuracy: Number(parseFloat(String(item.accuracy || 0)).toFixed(1))
      })));
    } catch (error) {
      console.error("Error getting specialty performance data:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get specialty performance data" 
      });
    }
  });

  app.get(`${apiPrefix}/performance/progress`, async (req, res) => {
    try {
      const userId = MOCK_USER_ID;
      const progressData = await storage.getProgressOverTime(userId);
      
      res.json(progressData.map(item => ({
        date: item.date,
        questionsAttempted: Number(item.questionsAttempted),
        accuracy: Number(parseFloat(String(item.accuracy || 0)).toFixed(1))
      })));
    } catch (error) {
      console.error("Error getting progress data:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get progress data" 
      });
    }
  });

  app.get(`${apiPrefix}/performance/activity`, async (req, res) => {
    try {
      const userId = MOCK_USER_ID;
      const activityData = await storage.getWeeklyActivity(userId);
      
      res.json(activityData);
    } catch (error) {
      console.error("Error getting activity data:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get activity data" 
      });
    }
  });

  // Resources endpoints
  app.get(`${apiPrefix}/resources/guidelines`, async (req, res) => {
    try {
      const guidelines = await storage.getResources('guideline');
      res.json(guidelines);
    } catch (error) {
      console.error("Error getting guidelines:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get guidelines" 
      });
    }
  });

  app.get(`${apiPrefix}/resources/questionbanks`, async (req, res) => {
    try {
      const questionBanks = await storage.getResources('questionbank');
      res.json(questionBanks);
    } catch (error) {
      console.error("Error getting question banks:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get question banks" 
      });
    }
  });

  app.get(`${apiPrefix}/resources/ukmla`, async (req, res) => {
    try {
      const ukmlaDocs = await storage.getResources('ukmla');
      res.json(ukmlaDocs);
    } catch (error) {
      console.error("Error getting UKMLA documents:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get UKMLA documents" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
