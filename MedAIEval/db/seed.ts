import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create default user
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, "janesmith")
    });

    if (!existingUser) {
      console.log("Creating default user...");
      const [user] = await db.insert(schema.users).values({
        username: "janesmith",
        password: "$2a$10$randomhashwouldbeherebutthisisaplaceholder",
        name: "Dr. Jane Smith",
        role: "Medical Student, Year 5"
      }).returning();
      console.log("Created user:", user.id);

      // Create user stats for the default user
      await db.insert(schema.userStats).values({
        userId: user.id,
        questionsAnswered: 124,
        accuracyRate: 78,
        questionsWeeklyChange: 12,
        accuracyWeeklyChange: 5,
        strongestArea: "Cardiology",
        strongestAreaAccuracy: 92,
        weakestArea: "Neurology",
        weakestAreaAccuracy: 62,
        activeDays: 12
      });
    }

    // Create medical specialties
    const specialtyData = [
      {
        name: "Cardiology",
        description: "Heart failure, arrhythmias, ischemic heart disease, and valvular disorders.",
        questionCount: 85,
        colorClass: "bg-primary",
        bgClass: "bg-primary bg-opacity-10",
        textClass: "text-primary",
        masteryPercentage: 70
      },
      {
        name: "Respiratory",
        description: "Asthma, COPD, pneumonia, pulmonary embolism, and respiratory failure.",
        questionCount: 64,
        colorClass: "bg-emerald-500",
        bgClass: "bg-emerald-100",
        textClass: "text-emerald-700",
        masteryPercentage: 55
      },
      {
        name: "Neurology",
        description: "Stroke, seizures, dementia, headache, and neurodegenerative disorders.",
        questionCount: 78,
        colorClass: "bg-red-500",
        bgClass: "bg-red-100",
        textClass: "text-red-700",
        masteryPercentage: 35
      },
      {
        name: "Gastroenterology",
        description: "IBD, liver disease, pancreatitis, and GI bleeding disorders.",
        questionCount: 52,
        colorClass: "bg-amber-500",
        bgClass: "bg-amber-100",
        textClass: "text-amber-700",
        masteryPercentage: 60
      },
      {
        name: "Endocrinology",
        description: "Diabetes, thyroid disorders, adrenal disease, and pituitary disorders.",
        questionCount: 45,
        colorClass: "bg-purple-500",
        bgClass: "bg-purple-100",
        textClass: "text-purple-700",
        masteryPercentage: 65
      },
      {
        name: "Nephrology",
        description: "Acute kidney injury, chronic kidney disease, glomerulonephritis, and electrolyte disorders.",
        questionCount: 38,
        colorClass: "bg-blue-500",
        bgClass: "bg-blue-100",
        textClass: "text-blue-700",
        masteryPercentage: 40
      }
    ];

    for (const specialty of specialtyData) {
      const existingSpecialty = await db.query.specialties.findFirst({
        where: eq(schema.specialties.name, specialty.name)
      });

      if (!existingSpecialty) {
        console.log(`Creating specialty: ${specialty.name}...`);
        await db.insert(schema.specialties).values(specialty);
      }
    }

    // Create sample activity log
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, "janesmith")
    });

    if (user) {
      // Only seed activities if they don't exist
      const activityCount = await db.select({ count: sql`count(*)` }).from(schema.activityLog);
      
      if (activityCount.length === 0 || activityCount[0].count === 0) {
        console.log("Creating sample activity logs...");
        const now = new Date();
        
        const activityData = [
          {
            userId: user.id,
            type: "answer",
            title: "Completed Cardiology Session",
            description: "8/10 correct answers",
            duration: 25,
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
          },
          {
            userId: user.id,
            type: "achievement",
            title: "Achievement Unlocked",
            description: "5-day study streak",
            duration: 0,
            createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Yesterday
          },
          {
            userId: user.id,
            type: "review",
            title: "Reviewed Respiratory Questions",
            description: "15 questions with detailed feedback",
            duration: 45,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            userId: user.id,
            type: "gap",
            title: "Identified Knowledge Gap",
            description: "Neurology - seizure management",
            duration: 0,
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          }
        ];
        
        for (const activity of activityData) {
          await db.insert(schema.activityLog).values(activity);
        }
      }
    }

    // Seed resources
    // Clinical Guidelines
    const existingGuidelines = await db.query.resources.findFirst({
      where: eq(schema.resources.type, "guideline")
    });

    if (!existingGuidelines) {
      console.log("Creating sample clinical guidelines...");
      const guidelineData = [
        {
          type: "guideline",
          title: "Acute Coronary Syndromes Management",
          description: "Comprehensive guidelines for the management of acute coronary syndromes, including STEMI, NSTEMI, and unstable angina.",
          url: "https://www.nice.org.uk/guidance/cg94",
          organization: "NICE Guidelines",
          tags: ["Cardiology", "Emergency Medicine", "STEMI", "NSTEMI"]
        },
        {
          type: "guideline",
          title: "Stroke and TIA Management",
          description: "Guidelines for diagnosis and management of stroke and transient ischemic attacks, including primary and secondary prevention.",
          url: "https://www.nice.org.uk/guidance/ng128",
          organization: "NICE Guidelines",
          tags: ["Neurology", "Stroke", "TIA", "Prevention"]
        },
        {
          type: "guideline",
          title: "Asthma Diagnosis and Management",
          description: "Latest evidence-based approach to diagnosing, monitoring and managing asthma in adults, children and young people.",
          url: "https://www.nice.org.uk/guidance/ng80",
          organization: "British Thoracic Society",
          tags: ["Respiratory", "Asthma", "Inhalers", "Exacerbations"]
        },
        {
          type: "guideline",
          title: "Diabetes in Pregnancy",
          description: "Management of diabetes and its complications from pre-conception to the postnatal period.",
          url: "https://www.nice.org.uk/guidance/ng3",
          organization: "NICE Guidelines",
          tags: ["Endocrinology", "Obstetrics", "Diabetes", "Pregnancy"]
        },
        {
          type: "guideline",
          title: "IBD Management Guidelines",
          description: "Diagnosis and management of ulcerative colitis and Crohn's disease in adults, children and young people.",
          url: "https://www.nice.org.uk/guidance/ng129",
          organization: "British Society of Gastroenterology",
          tags: ["Gastroenterology", "IBD", "Crohn's", "Ulcerative Colitis"]
        },
        {
          type: "guideline",
          title: "Chronic Kidney Disease Management",
          description: "Early identification and management of chronic kidney disease in adults in primary and secondary care.",
          url: "https://www.nice.org.uk/guidance/cg182",
          organization: "NICE Guidelines",
          tags: ["Nephrology", "CKD", "Renal", "Dialysis"]
        }
      ];

      for (const guideline of guidelineData) {
        await db.insert(schema.resources).values(guideline);
      }
    }

    // Question Banks
    const existingQuestionBanks = await db.query.resources.findFirst({
      where: eq(schema.resources.type, "questionbank")
    });

    if (!existingQuestionBanks) {
      console.log("Creating sample question banks...");
      const questionBankData = [
        {
          type: "questionbank",
          title: "PassMedicine",
          description: "Extensive question bank specifically designed for medical school finals and the UK Medical Licensing Assessment.",
          url: "https://www.passmedicine.com",
          platform: "PassMedicine",
          free: false,
          hasDemo: true,
          demoUrl: "https://www.passmedicine.com/demo",
          questionCount: 3500,
          tags: ["UKMLA", "Finals", "SBAs", "EMQs"]
        },
        {
          type: "questionbank",
          title: "UKMLA Question Bank",
          description: "Official question bank with practice questions in the exact format of the UKMLA examination.",
          url: "https://www.gmc-uk.org/education/ukmla",
          platform: "General Medical Council",
          free: true,
          hasDemo: true,
          demoUrl: "https://www.gmc-uk.org/education/ukmla/practice",
          questionCount: 1000,
          tags: ["UKMLA", "Applied Knowledge Test", "Official"]
        },
        {
          type: "questionbank",
          title: "Pastest UKMLA",
          description: "High-quality questions with detailed explanations, covering all aspects of the UKMLA curriculum.",
          url: "https://www.pastest.com/ukmla",
          platform: "Pastest",
          free: false,
          hasDemo: true,
          demoUrl: "https://www.pastest.com/ukmla/demo",
          questionCount: 2800,
          tags: ["UKMLA", "Medical Finals", "Clinical Skills"]
        }
      ];

      for (const bank of questionBankData) {
        await db.insert(schema.resources).values(bank);
      }
    }

    // UKMLA Documents
    const existingUKMLA = await db.query.resources.findFirst({
      where: eq(schema.resources.type, "ukmla")
    });

    if (!existingUKMLA) {
      console.log("Creating UKMLA resources...");
      const ukmlaData = [
        {
          type: "ukmla",
          title: "UKMLA Content Map",
          description: "Detailed breakdown of knowledge areas and learning outcomes covered in the UKMLA examination.",
          url: "https://www.gmc-uk.org/education/ukmla/content-map",
          publisher: "General Medical Council",
          date: "2023-10-15",
          tags: ["UKMLA", "Curriculum", "Learning Outcomes"]
        },
        {
          type: "ukmla",
          title: "UKMLA Implementation Timeline",
          description: "Official timeline for the phased implementation of the UK Medical Licensing Assessment.",
          url: "https://www.gmc-uk.org/education/ukmla/timeline",
          publisher: "General Medical Council",
          date: "2023-09-01",
          tags: ["UKMLA", "Implementation", "Timeline"]
        },
        {
          type: "ukmla",
          title: "Applied Knowledge Test Format",
          description: "Explanation of the format, question types, and scoring system for the AKT component of the UKMLA.",
          url: "https://www.gmc-uk.org/education/ukmla/akt-format",
          publisher: "General Medical Council",
          date: "2023-11-20",
          tags: ["UKMLA", "AKT", "Assessment Format"]
        },
        {
          type: "ukmla",
          title: "Clinical and Professional Skills Assessment Guide",
          description: "Comprehensive guide to the CPSA component, including station types, marking criteria, and preparation advice.",
          url: "https://www.gmc-uk.org/education/ukmla/cpsa-guide",
          publisher: "General Medical Council",
          date: "2023-12-05",
          tags: ["UKMLA", "CPSA", "Clinical Skills", "OSCE"]
        }
      ];

      for (const doc of ukmlaData) {
        await db.insert(schema.resources).values(doc);
      }
    }

    // Performance data for charts
    const userId = user?.id;
    
    if (userId) {
      // Sample performance by specialty data
      const specialtyPerformance = await db.query.specialties.findMany();
      
      if (specialtyPerformance.length > 0) {
        // Create sample performance data for charts if none exists
        const performanceByDifficulty = [
          {
            difficulty: "Foundation",
            questions: 45,
            accuracy: 85
          },
          {
            difficulty: "Intermediate",
            questions: 35,
            accuracy: 72
          },
          {
            difficulty: "Advanced",
            questions: 28,
            accuracy: 65
          },
          {
            difficulty: "UKMLA",
            questions: 16,
            accuracy: 58
          }
        ];
        
        // Progress over time data (last 10 days)
        const now = new Date();
        const progressData = [];
        
        for (let i = 9; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          progressData.push({
            date: dateString,
            questionsAttempted: Math.floor(Math.random() * 10) + 5,
            accuracy: Math.floor(Math.random() * 25) + 60
          });
        }
        
        // Weekly activity data
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weeklyActivityData = daysOfWeek.map(day => ({
          day,
          questions: Math.floor(Math.random() * 15),
          minutes: Math.floor(Math.random() * 60)
        }));
        
        console.log("Seeding completed successfully!");
      }
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
  }
}

seed();
