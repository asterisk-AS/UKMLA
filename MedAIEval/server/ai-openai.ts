import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function openaiRequest(prompt: string): Promise<any> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is missing');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    try {
      return JSON.parse(content);
    } catch (jsonError) {
      console.error('Error parsing JSON from OpenAI response:', jsonError);
      // Return the raw text as fallback
      return { rawResponse: content };
    }
  } catch (error) {
    console.error('OpenAI request error:', error);
    throw new Error(`OpenAI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateQuestions(specialty: string, difficulty: string, count: number, topics?: string) {
  try {
    let targetYear = "Early Clinical (Year 3-4)";
    if (difficulty === "Foundation") {
      targetYear = "Pre-clinical (Year 1-2)";
    } else if (difficulty === "Advanced" || difficulty === "UKMLA") {
      targetYear = "Final Year (Year 5-6)";
    }

    const prompt = `You are an experienced medical educator creating high-quality short answer questions for UK medical students that align with the UKMLA framework. Generate ${count} clinical case scenarios for UK medical students based on the UKMLA curriculum.

## Question Parameters
- Specialty: ${specialty}
- Difficulty Level: ${difficulty}
- Target Year Level: ${targetYear}
${topics ? `- Specific topics to focus on: ${topics}` : ''}

## Question Structure
For each question:
1. Create a realistic clinical vignette (130-180 words) that includes:
   - Relevant demographic information (age, gender)
   - Presenting complaint with clear timeline
   - Key history elements (positive and negative findings)
   - Physical examination findings
   - Relevant test results with reference ranges

2. After the vignette, include 1-3 specific questions that:
   - Test clinical reasoning and knowledge application (not just recall)
   - Are appropriate for the ${difficulty} difficulty level
   - Require short essay responses (limit: 600-800 characters)
   - Have specific mark allocation (e.g., i, ii, iii with marks shown)

3. Each case should follow this structure:
   - Begin with a patient presentation in a clinical setting
   - Present a focused clinical scenario with appropriate complexity
   - Include sufficient information to answer the questions without extraneous details
   - For ${difficulty} level, focus on ${difficulty === "Foundation" ? "basic pathophysiology and mechanisms" : difficulty === "Intermediate" ? "common presentations and typical management" : "complex scenarios and nuanced decision-making"}

## Answer Requirements
For each question, provide:
1. A concise, accurate model answer that would receive full marks
2. 2-3 specific, actionable strengths to look for in student answers
3. 2-3 specific, actionable areas for improvement
4. 2-3 focused learning points directly related to the case
5. 2-3 related resources with actual, valid URLs to UK medical resources (NHS guidelines, NICE guidelines, BMJ Best Practice, etc.)

## Output Format
Return a JSON object with this structure:
{
  "questions": [
    {
      "specialty": "${specialty}",
      "difficulty": "${difficulty}",
      "scenario": "The clinical case scenario text...",
      "question": "The specific question text with numbered sub-questions and mark allocation...",
      "modelAnswer": "The concise, accurate model answer...",
      "strengths": ["Specific, actionable strength 1", "Specific, actionable strength 2"],
      "areasForImprovement": ["Specific, actionable area 1", "Specific, actionable area 2"],
      "learningPoints": ["Focused learning point 1", "Focused learning point 2"],
      "relatedResources": [
        {
          "title": "NICE Guidelines - [Specific Topic]",
          "url": "https://www.nice.org.uk/guidance/[actual-guideline-id]"
        },
        {
          "title": "BMJ Best Practice - [Specific Topic]",
          "url": "https://bestpractice.bmj.com/topics/[actual-topic-id]"
        }
      ]
    }
  ]
}

Ensure all questions are clinically accurate, reflect current UK medical practice, and use clear, unambiguous language. The questions should test application of knowledge rather than simple recall.`;

    const response = await openaiRequest(prompt);
    
    // Handle different response formats
    if (response.questions) {
      // Proper JSON format with questions array
      return response.questions;
    } else if (Array.isArray(response)) {
      // Direct array of questions
      return response;
    } else if (response.rawResponse) {
      // Fallback parsing if JSON structure wasn't found
      console.warn('OpenAI response not in expected JSON format. Attempting alternate parsing.');
      try {
        // Try to extract any JSON-like structures from the raw text
        const jsonMatch = response.rawResponse.match(/\[\s*{[\s\S]*?}\s*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract question data from response');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to parse questions from raw response: ${errorMessage}`);
      }
    } else {
      // Unknown response format
      throw new Error('Unexpected response format from OpenAI');
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function evaluateAnswer(questionData: any, userAnswer: string) {
  try {
    const prompt = `You are an experienced medical educator providing detailed assessment of a medical student's answer to a short answer question based on the UKMLA curriculum.

## Question Information
Question: ${questionData.question}
Clinical Scenario: ${questionData.scenario}
Student's Answer: ${userAnswer}
Model Answer: ${questionData.modelAnswer}

## Assessment Guidelines
Create a detailed marking assessment that evaluates this answer considering:

1. Expected answer components with specific criteria:
   - Must-include core knowledge points
   - Clinical reasoning elements
   - Application of basic science concepts (where relevant)
   - Prioritization of management steps (where relevant)
   - Safety considerations (where relevant)

2. Alternative acceptable approaches:
   - Regional/international variations in practice
   - Alternative evidence-based approaches

3. Unacceptable elements that should not receive credit:
   - Outdated practices
   - Dangerous approaches
   - Fundamentally incorrect concepts

## Score Guidance
Score on a scale of 1-10 (with 10 being perfect) based on:
- Clinical accuracy and relevance (50%)
- Completeness of key points (25%)
- Application of clinical reasoning (25%)

Provide a fair and objective assessment that:
- Recognizes partial knowledge
- Rewards clinical reasoning over rote memorization
- Considers appropriate level of detail for the difficulty level

## Return Format
Return a JSON object with the following structure:
{
  "score": <number between 1-10>,
  "modelAnswer": "Concise model answer with key points clearly articulated",
  "strengths": [
    "Specific strength highlighting what the student did well", 
    "Another specific strength with direct reference to their answer"
  ],
  "areasForImprovement": [
    "Specific, actionable area for improvement with rationale", 
    "Another specific area with suggestion for improvement"
  ],
  "learningPoints": [
    "Focused learning point directly relevant to the case", 
    "Another key learning point emphasizing clinical application"
  ],
  "relatedResources": [
    {
      "title": "NICE Guidelines - Specific condition/management",
      "url": "https://www.nice.org.uk/guidance/ng123" (use actual NICE guideline numbers)
    },
    {
      "title": "BMJ Best Practice - Specific condition",
      "url": "https://bestpractice.bmj.com/topics/en-gb/123" (use actual BMJ topic numbers)
    }
  ]
}

## Important Guidelines
- Provide specific, actionable feedback rather than generic comments
- Include valid URLs to current UK medical resources (NHS, NICE, BMJ, etc.)
- Focus on clinical reasoning and application rather than writing style
- Highlight specific strengths in the answer before addressing improvements
- Make all feedback clear, constructive and educationally valuable
- Be concise and specific - each feedback point should be no more than 1-2 sentences

Ensure your response is properly formatted as a JSON object as shown above.`;

    const response = await openaiRequest(prompt);
    
    // If we got raw text instead of parsed JSON, attempt to extract the JSON portion
    if (response.rawResponse) {
      console.warn('OpenAI response not in expected JSON format. Attempting alternate parsing.');
      try {
        // Try to extract any JSON-like structures from the raw text
        const jsonMatch = response.rawResponse.match(/{[\s\S]*?}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract evaluation data from response');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to parse evaluation from raw response: ${errorMessage}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw new Error(`Failed to evaluate answer: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
