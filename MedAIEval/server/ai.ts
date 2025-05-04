import { createNewChat, sendMessage } from 'deepseek-api';

// DeepSeek API implementation using user token-based authentication
// DeepSeek tokens are stored as JSON in localStorage, so we need to parse it if it's in that format
const parseToken = (token: string | undefined): string => {
  if (!token) return '';
  
  console.log('Token received (first 10 chars):', token.substring(0, 10) + '...');
  
  try {
    // Check if the token is a JSON string (like {"value":"actual-token","__version":"0"})
    const parsed = JSON.parse(token);
    console.log('Successfully parsed token as JSON');
    return parsed.value || token;
  } catch (e) {
    // If not JSON or no 'value' property, return the token as-is
    console.log('Token is not in JSON format, using as-is');
    return token;
  }
};

const USER_TOKEN = parseToken(process.env.DEEPSEEK_USER_TOKEN);
console.log('Using DeepSeek with token (length):', USER_TOKEN.length);

// Helper function to perform DeepSeek requests with proper response handling
async function deepseekRequest(prompt: string): Promise<any> {
  try {
    if (!USER_TOKEN) {
      throw new Error('DEEPSEEK_USER_TOKEN environment variable is missing');
    }

    // Create a new chat session for this request
    console.log('Creating new DeepSeek chat session...');
    const chatID = await createNewChat(USER_TOKEN);
    console.log('Chat creation result:', typeof chatID === 'string' ? 'success' : 'error', 
              typeof chatID === 'string' ? `(ID: ${chatID.substring(0, 5)}...)` : `(Error: ${JSON.stringify(chatID)}`);
    
    if (typeof chatID !== 'string') {
      throw new Error(`Failed to create DeepSeek chat session: ${chatID.error}`);
    }

    // Store all content chunks for the complete response
    let fullContent = '';
    
    // Send the message and collect the response
    const response = await sendMessage(prompt, {
      id: chatID,
      token: USER_TOKEN
    }, (chunk: {
      type: 'message' | 'thinking' | 'search' | 'error' | 'done';
      content?: string;
      error?: string;
    }) => {
      // Handle different response types
      if (chunk.type === 'message' && chunk.content) {
        fullContent += chunk.content;
      } else if (chunk.type === 'error') {
        console.error('DeepSeek error:', chunk.error);
      }
    });

    // At this point, fullContent should contain the complete response
    // We need to parse it as JSON if possible
    try {
      // Find the JSON part in the response (may be surrounded by markdown code blocks)
      const jsonMatch = fullContent.match(/```(json)?\s*({[\s\S]*?})\s*```/) || 
                      fullContent.match(/{[\s\S]*?}/); // Fallback to finding any JSON-like content
      
      const jsonContent = jsonMatch ? (jsonMatch[2] || jsonMatch[0]).trim() : fullContent;
      return JSON.parse(jsonContent);
    } catch (jsonError) {
      console.error('Error parsing JSON from DeepSeek response:', jsonError);
      // Return the raw text as fallback
      return { rawResponse: fullContent };
    }
  } catch (error) {
    console.error('DeepSeek request error:', error);
    throw new Error(`DeepSeek request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateQuestions(specialty: string, difficulty: string, count: number, topics?: string) {
  try {
    const prompt = `Generate ${count} short answer medical questions based on the UKMLA curriculum for UK clinical medical students.

- Specialty: ${specialty}
- Difficulty: ${difficulty}
${topics ? `- Specific topics to focus on: ${topics}` : ''}

For each question, provide:
1. A realistic clinical scenario
2. A specific question for the student to answer
3. An ideal model answer that would receive full marks
4. 3-5 strengths to look for in student answers
5. 3-5 common areas for improvement
6. 3-5 additional learning points related to the case

Format the response as a JSON array with the following structure for each question:
{
  "questions": [
    {
      "specialty": "${specialty}",
      "difficulty": "${difficulty}",
      "scenario": "The clinical scenario text...",
      "question": "The specific question...",
      "modelAnswer": "The ideal answer to receive full marks...",
      "strengths": ["Strength 1", "Strength 2", ...],
      "areasForImprovement": ["Area 1", "Area 2", ...],
      "learningPoints": ["Learning point 1", "Learning point 2", ...],
      "relatedResources": [
        {
          "type": "pdf|video|guide|case",
          "title": "Resource title",
          "url": "https://example.com/resource"
        }
      ]
    }
  ]
}

Please ensure your response is a properly formatted JSON object with the structure shown above.`;

    const response = await deepseekRequest(prompt);
    
    // Handle different response formats
    if (response.questions) {
      // Proper JSON format with questions array
      return response.questions;
    } else if (Array.isArray(response)) {
      // Direct array of questions
      return response;
    } else if (response.rawResponse) {
      // Fallback parsing if JSON structure wasn't found
      console.warn('DeepSeek response not in expected JSON format. Attempting alternate parsing.');
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
      throw new Error('Unexpected response format from DeepSeek');
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function evaluateAnswer(questionData: any, userAnswer: string) {
  try {
    const prompt = `Evaluate this medical student's answer to a short answer question based on the UKMLA curriculum.

Question: ${questionData.question}
Clinical Scenario: ${questionData.scenario}
Student's Answer: ${userAnswer}

The model answer is: ${questionData.modelAnswer}

Please evaluate the answer considering:
1. Clinical accuracy
2. Completeness
3. Relevance
4. Clarity of expression

Return a JSON object with the following structure:
{
  "score": "Percentage score (0-100)",
  "modelAnswer": "HTML formatted model answer with key points highlighted",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasForImprovement": ["Area 1", "Area 2", "Area 3"],
  "learningPoints": ["Learning point 1", "Learning point 2", "Learning point 3"],
  "relatedResources": [
    {
      "type": "pdf|video|guide|case",
      "title": "Resource title",
      "url": "https://example.com/resource"
    }
  ]
}

Ensure your response is properly formatted as a JSON object as shown above.`;

    const response = await deepseekRequest(prompt);
    
    // If we got raw text instead of parsed JSON, attempt to extract the JSON portion
    if (response.rawResponse) {
      console.warn('DeepSeek response not in expected JSON format. Attempting alternate parsing.');
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
