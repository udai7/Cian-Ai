import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    // Get the current user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { interviewId, userInput, currentQuestion, transcript } = await req.json();

    if (!interviewId || !userInput || currentQuestion === undefined || !transcript) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the interview
    const interview = await db.aiInterview.findUnique({
      where: {
        id: interviewId,
      },
    });

    if (!interview || interview.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }

    // Check if we have questions left
    if (currentQuestion >= interview.questions.length) {
      return NextResponse.json(
        {
          success: true,
          message: "We have completed all the questions. Let's wrap up the interview. Thank you for your time.",
          endInterview: true,
        },
        { status: 200 }
      );
    }

    // Generate response using Gemini
    const response = await generateResponse(
      interview,
      userInput,
      currentQuestion,
      transcript
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in conversation API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process conversation" },
      { status: 500 }
    );
  }
}

// Helper function to generate AI response
async function generateResponse(interview, userInput, currentQuestion, transcript) {
  try {
    // Create a system message that explains the AI's role and provides context
    const prompt = `You are an AI interviewer conducting a ${interview.type} interview for a ${interview.level} ${interview.role} position.
    
The technologies relevant to this position are: ${interview.techStack.join(", ")}.

Your task is to:
1. Evaluate the candidate's response to the current question
2. Provide a follow-up based on their answer or ask for clarification if needed
3. Decide if it's time to move to the next question

Current question: "${interview.questions[currentQuestion]}"

If the candidate has fully answered the question and provided sufficient detail, you may move to the next question.
If the answer was incomplete or needs elaboration, ask a follow-up question related to the same topic.

Important:
- Maintain a professional interviewer tone
- Keep responses concise (max 2-3 sentences)
- Do not explain that you are an AI
- Do not provide the correct answer or critique the response yet (save feedback for the end)

In your response, include one of these flags in your reasoning:
- MOVE_TO_NEXT if we should move to the next question
- STAY_ON_CURRENT if we need more information on the current question
- END_INTERVIEW if this was the final question or we've covered enough ground

Conversation history:
${transcript.slice(-10).map(message => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n')}

USER: ${userInput}`;

    // Access Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const assistantMessage = response.text();

    // Determine if we should move to the next question
    const moveToNextQuestion = assistantMessage.includes("MOVE_TO_NEXT");
    const endInterview = assistantMessage.includes("END_INTERVIEW");
    
    // Remove the flags from the message before sending it to the user
    const cleanedMessage = assistantMessage
      .replace("MOVE_TO_NEXT", "")
      .replace("STAY_ON_CURRENT", "")
      .replace("END_INTERVIEW", "")
      .trim();

    return {
      success: true,
      message: cleanedMessage,
      moveToNextQuestion,
      endInterview,
    };
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate interview response");
  }
} 