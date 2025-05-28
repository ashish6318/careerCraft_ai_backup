import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/User.js';
import { extractTextFromResume } from '../utils/resumeParser.js';

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// Using a known model name we discussed. Replace if you have confirmed "gemini-2.5-flash-latest" is correct and available.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const getResumeSuggestions = async (req, res) => {
  try {
    // --- THIS PART IS CRUCIAL AND WAS OMITTED IN YOUR PASTED SNIPPET ---
    const seekerId = req.user._id;
    const seeker = await User.findById(seekerId);

    if (!seeker) {
      return res.status(404).json({ message: 'Seeker profile not found.' });
    }
    if (!seeker.resumeUrl) {
      return res.status(400).json({ message: 'No resume uploaded. Please upload your resume first.' });
    }

    // 1. Declare resumeText here, in the scope of the main try block
    let resumeText;

    // 2. Try to extract text and assign it to resumeText
    try {
      console.log('[AIController] Attempting to extract text from resume:', seeker.resumeUrl);
      resumeText = await extractTextFromResume(seeker.resumeUrl);
      console.log('[AIController] Text extraction successful (first 100 chars):', resumeText ? resumeText.substring(0, 100) + "..." : "No text extracted or empty.");
    } catch (extractionError) {
      console.error('[AIController] Resume text extraction failed:', extractionError.message, extractionError);
      // This return is crucial: it stops execution if extraction fails
      return res.status(500).json({ message: `Failed to process your resume: ${extractionError.message}` });
    }
    // --- END OF CRUCIAL OMITTED PART ---

    // 3. Check if resumeText was successfully populated
    // This is where your pasted snippet likely started
    if (!resumeText || resumeText.trim().length < 50) {
      console.warn('[AIController] Not enough text extracted or resumeText is null/undefined:', resumeText ? resumeText.trim().length : 'N/A');
      return res.status(400).json({ message: 'Could not extract sufficient text from the resume. Please ensure it is a text-based PDF and has enough content.' });
    }
    
    const prompt = `
      You are an expert career coach and resume reviewer, specializing in tech industry roles (like Software Engineering, Data Science, Product Management, AI/ML).
      Analyze the following resume text thoroughly and provide comprehensive, actionable suggestions for improvement.

      **Desired Output Format:**
      Please structure your feedback using Markdown. Use headings (e.g., ## Section Title) for distinct categories of feedback and bullet points (using '-' or '*') for individual suggestions. Ensure there are clear newlines between points for readability.

      **Areas to Focus On (provide detailed feedback for each):**

      1.  **Overall Impression & Summary (2-3 sentences):**
          * Briefly state the perceived strengths and a key area for immediate improvement.
      2.  **Contact Information & Header:**
          * Completeness (Name, Phone, Email, LinkedIn, Portfolio/GitHub if relevant).
          * Professionalism of email address.
      3.  **Summary/Objective Statement (if present):**
          * Clarity, conciseness, and impact.
          * Alignment with typical tech roles. Is it tailored or generic?
      4.  **Experience Section:**
          * Use of **action verbs** to start bullet points (provide 2-3 examples of stronger verbs if weak ones are used).
          * **Quantification of achievements:** Are results and accomplishments quantified with numbers or specific outcomes? (Provide 1-2 examples of how a point could be quantified if it's missing).
          * Clarity and conciseness of descriptions.
          * Relevance to tech roles.
      5.  **Projects Section (if present):**
          * Clear description of the project and the candidate's role.
          * Technologies used.
          * Quantifiable outcomes or impact, if applicable.
      6.  **Skills Section:**
          * Relevance of listed skills to modern tech roles.
          * Organization (e.g., categorized by Programming Languages, Frameworks, Tools, Databases).
          * Proficiency levels (if indicated, are they appropriate?).
      7.  **Education Section:**
          * Clarity, correct formatting (Degree, Major, University, Graduation Date).
          * Inclusion of relevant coursework or academic projects if a recent graduate.
      8.  **ATS (Applicant Tracking System) Optimization & Keywords:**
          * Are there relevant keywords for common tech roles?
          * Suggest 2-3 general keywords that might be missing if applicable for a general tech resume.
      9.  **Formatting & Readability (based on the text structure):**
          * Comments on perceived consistency, use of bullet points, and overall ease of reading (even from raw text).
          * Length (is it appropriately concise, typically 1 page for less experienced, max 2 for experienced?).
      10. **Actionable Next Steps (2-3 key takeaways):**
          * What are the most critical things the candidate should do to improve this resume?

      If the resume text is very short, lacks detail, or is poorly structured, make that a primary point of your feedback and explain why it's problematic.
      Aim for a comprehensive review that would be genuinely helpful.

      Resume Text:
      ---
      ${resumeText.substring(0, 30000)} 
      ---
      End of Resume Text. Provide your feedback in Markdown format now.
    `;

    const generationConfig = {
        temperature: 0.6,
    };

    console.log('[AIController] Sending prompt to Gemini model:', model.model);
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
    });
    const response = result.response;
    const suggestions = response.text();
    console.log('[AIController] Received suggestions from Gemini.');


    if (!suggestions || suggestions.trim() === "") {
      console.warn('[AIController] Gemini response details (empty/blocked):', response);
      if (response.promptFeedback && response.promptFeedback.blockReason) {
        throw new Error(`AI could not generate suggestions. Reason: ${response.promptFeedback.blockReason}`);
      }
      throw new Error('AI did not return any suggestions. The response might be empty or blocked.');
    }

    res.status(200).json({ suggestions });

  } catch (error) {
    console.error('[AIController] Error in getResumeSuggestions:', error.message);
    if (typeof error !== 'string' && error.message) {
        console.error('[AIController] Full Error Object:', error);
    }
    res.status(500).json({ message: `Server Error: Could not get resume suggestions. ${error.message}` });
  }
};
const generateAiMockTestQuestions = async (req, res) => {
  try {
    const {
      category, // e.g., "JavaScript"
      topic,    // e.g., "Asynchronous Programming"
      difficultyLevel = 'Intermediate', // Default to Intermediate
      numberOfQuestions = 5,          // Default to 5 questions
      questionType = 'MCQ_4_OPTIONS'  // For now, specifically MCQs with 4 options
    } = req.body;

    if (!category || !topic) {
      return res.status(400).json({ message: 'Category and topic are required to generate questions.' });
    }

    const numQuestions = parseInt(numberOfQuestions, 10);
    if (isNaN(numQuestions) || numQuestions <= 0 || numQuestions > 20) { // Max 20 questions per request for safety/cost
        return res.status(400).json({ message: 'Number of questions must be between 1 and 20.' });
    }

    // Construct the prompt for Gemini
    // We need to be very specific about the JSON output structure.
    const prompt = `
      You are an expert technical instructor and question writer.
      Generate ${numQuestions} Multiple Choice Questions (MCQs) for a mock test.

      Subject Category: "${category}"
      Specific Topic: "${topic}"
      Target Difficulty Level: "${difficultyLevel}"

      Each question must have exactly 4 distinct answer options.
      For each question, clearly indicate the correct answer option by its 0-based index (0, 1, 2, or 3).
      Provide a concise explanation for why the correct answer is correct.
      Assign 1 mark for each question.
      The difficulty field for each question should reflect the question's own difficulty, ideally aligning with the overall target difficulty.

      VERY IMPORTANT: Structure your entire response STRICTLY as a single JSON array. Each element in the array must be a JSON object representing one question, formatted EXACTLY as follows:
      {
        "questionText": "string (The question content)",
        "options": ["string (Option A)", "string (Option B)", "string (Option C)", "string (Option D)"],
        "correctOptionIndex": "number (0, 1, 2, or 3)",
        "explanation": "string (Brief explanation for the correct answer)",
        "marks": 1,
        "difficulty": "string (e.g., 'Easy', 'Medium', 'Hard')"
      }

      Do not include any introductory text, concluding text, or any other content outside of this JSON array structure.
      The response must be parsable by JSON.parse().
      Example of a single question object in the array:
      {
        "questionText": "What is a closure in JavaScript?",
        "options": ["A type of bracket", "A function having access to its own scope, the scope of the outer functions, and the global scope", "A way to close a browser window", "A CSS property"],
        "correctOptionIndex": 1,
        "explanation": "A closure is a function that remembers its outer lexical environment, even when the function is executed outside that environment.",
        "marks": 1,
        "difficulty": "Medium"
      }
      Now, generate the ${numQuestions} questions based on the specified category, topic, and difficulty.
    `;

    const generationConfig = {
      temperature: 0.7, // Allow for some creativity in question wording
      // responseMimeType: "application/json", // Some Gemini versions/SDKs support this for enforcing JSON output
    };
    
    console.log(`[AIController] Generating ${numQuestions} questions for: Category='${category}', Topic='${topic}', Difficulty='${difficultyLevel}'`);

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
    });
    const response = result.response;
    let aiResponseText = response.text();

    if (!aiResponseText || aiResponseText.trim() === "") {
      console.warn('[AIController] Gemini response was empty or blocked. Details:', response);
      if (response.promptFeedback && response.promptFeedback.blockReason) {
        throw new Error(`AI could not generate questions. Reason: ${response.promptFeedback.blockReason}`);
      }
      throw new Error('AI did not return any questions. The response was empty.');
    }
    
    // Sometimes the AI might wrap the JSON in ```json ... ``` or add other text.
    // Try to extract the JSON array part if necessary.
    const jsonMatch = aiResponseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (jsonMatch && jsonMatch[0]) {
        aiResponseText = jsonMatch[0];
    } else {
        console.warn("[AIController] AI response might not be a valid JSON array. Raw response:", aiResponseText);
        // Attempt to parse anyway, it might still be valid JSON without the explicit array brackets if only one question was asked for (unlikely with our prompt)
    }

    let generatedQuestions;
    try {
      generatedQuestions = JSON.parse(aiResponseText);
      // Basic validation of the parsed structure
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error("AI response was not a valid array of questions or the array was empty.");
      }
      // Further validation for each question object can be added here
      generatedQuestions.forEach((q, index) => {
        if (!q.questionText || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctOptionIndex !== 'number' || !q.explanation) {
          console.warn(`[AIController] Generated question at index ${index} has an invalid structure:`, q);
          throw new Error(`Generated question at index ${index+1} has an invalid structure. Please check options, correctOptionIndex, or explanation.`);
        }
      });

    } catch (parseError) {
      console.error('[AIController] Failed to parse AI response as JSON:', parseError.message);
      console.error('[AIController] Raw AI response that failed parsing:', aiResponseText);
      throw new Error('AI returned data in an unexpected format. Could not parse questions.');
    }

    res.status(200).json({
      message: `${generatedQuestions.length} questions generated successfully.`,
      questions: generatedQuestions,
      // You might also return the input params for context:
      // inputParams: { category, topic, difficultyLevel, numberOfQuestions }
    });

  } catch (error) {
    console.error('[AIController] Error in generateAiMockTestQuestions:', error.message);
    if (typeof error !== 'string' && error.message) { console.error('[AIController] Full Error Object:', error); }
    res.status(500).json({ message: `Server Error: Could not generate test questions. ${error.message}` });
  }
};const getCareerRoadmap = async (req, res) => {
  try {
    const { role, currentMessage, conversationHistory } = req.body;

    if (!currentMessage) { // A current message/query is always expected from the frontend now
      return res.status(400).json({ message: 'A current message from the user is required.' });
    }

    let chatHistoryForSDK = Array.isArray(conversationHistory) ? conversationHistory : [];
    let promptForThisTurn = currentMessage;

    // Check if this is an initial detailed roadmap request signaled by the 'role' parameter
    // and typically an empty or non-existent prior history from the client's perspective for this topic.
    if (role && chatHistoryForSDK.length === 0) {
      // Construct the detailed initial prompt using the role and the user's initial query.
      promptForThisTurn = `
        You are an experienced career advisor and mentor in the tech industry.
        A user is asking for a career roadmap to become a "${role}". Their specific initial query was: "${currentMessage}".

        Please provide a structured and actionable roadmap. The roadmap should include:
        1.  **Introduction to the Role (2-3 sentences):** Briefly describe what a ${role} does.
        2.  **Core Skills to Master:** List key technical skills.
        3.  **Learning Phases/Stages (e.g., Foundational, Intermediate, Advanced):**
            * For each phase, suggest specific topics to learn and types of learning resources.
        4.  **Project Ideas:** Suggest 2-3 types of projects.
        5.  **Portfolio Building:** Briefly mention its importance.
        6.  **Interview Preparation:** Key areas to focus on.
        7.  **Continuous Learning:** Emphasize staying updated.

        Format the entire response STRICTLY in Markdown. Use headings (e.g., ## Section Title) and bullet points.
        Ensure the roadmap is practical and motivating.

        Now, generate the roadmap for the role: "${role}".
      `;
      // For this very first detailed prompt for a new role, history sent to startChat should be empty.
      chatHistoryForSDK = [];
    }
    
    // Ensure history is valid (starts with user, alternates) if not empty.
    // The client should already be sending a valid sequence if history is not empty.
    // The SDK will validate this. If an error occurs here, client sent bad history.
    if (chatHistoryForSDK.length > 0 && chatHistoryForSDK[0].role !== 'user') {
        console.warn('[AIController] Received conversationHistory that does not start with a user role. This might cause errors with the LLM. History:', chatHistoryForSDK);
        // Depending on strictness, you might clear it or try to fix it.
        // For now, we rely on the client sending valid history after the first user message.
    }

    const chat = model.startChat({
        history: chatHistoryForSDK, // History of *previous* actual dialogue turns.
        generationConfig: { temperature: 0.7 }
    });
    
    console.log(`[AIController] Sending to Gemini. History length: ${chatHistoryForSDK.length}, Current Prompt: "${promptForThisTurn.substring(0,100)}..."`);

    const result = await chat.sendMessage(promptForThisTurn);
    const response = result.response;
    const aiResponseText = response.text();

    if (!aiResponseText || aiResponseText.trim() === "") {
      // ... (error handling for empty/blocked response)
      console.warn('[AIController] Gemini roadmap response was empty or blocked. Details:', response);
      if (response.promptFeedback && response.promptFeedback.blockReason) {
        throw new Error(`AI could not generate response. Reason: ${response.promptFeedback.blockReason}`);
      }
      throw new Error('AI did not return any content. The response was empty.');
    }

    res.status(200).json({ roadmap: aiResponseText });

  } catch (error) {
    console.error('[AIController] Error in getCareerRoadmap (conversational):', error.message);
    if (typeof error !== 'string' && error.message) { console.error('[AIController] Full Error Object:', error); }
    res.status(500).json({ message: `Server Error: Could not generate career advice. ${error.message}` });
  }
};

// Make sure getCareerRoadmap is exported along with other aiController functions
export { getResumeSuggestions, generateAiMockTestQuestions, getCareerRoadmap };
