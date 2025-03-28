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
    const { interviewId, transcript } = await req.json();

    if (!interviewId || !transcript || !Array.isArray(transcript)) {
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

    // Check if feedback already exists
    const existingFeedback = await db.interviewFeedback.findUnique({
      where: {
        interviewId: interviewId,
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { success: true, feedbackId: existingFeedback.id },
        { status: 200 }
      );
    }

    // Generate feedback using Gemini
    const feedback = await generateFeedback(interview, transcript);

    // Save feedback to database
    const savedFeedback = await db.interviewFeedback.create({
      data: {
        interviewId: interviewId,
        transcript: transcript,
        totalScore: feedback.totalScore,
        categoryScores: feedback.categoryScores,
        strengths: feedback.strengths,
        areasForImprovement: feedback.areasForImprovement,
        finalAssessment: feedback.finalAssessment,
      },
    });

    // Update interview status to completed
    await db.aiInterview.update({
      where: {
        id: interviewId,
      },
      data: {
        status: "completed",
      },
    });

    return NextResponse.json(
      { success: true, feedbackId: savedFeedback.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}

// Helper function to generate feedback
async function generateFeedback(interview, transcript) {
  try {
    // Create prompt for Gemini
    const prompt = `You are an expert interviewer and hiring manager evaluating an interview for a ${interview.level} ${interview.role} position.
    
The interview focused on ${interview.type} questions and covered technologies including: ${interview.techStack.join(", ")}.

Your task is to provide comprehensive feedback on the candidate's performance including:
1. Overall assessment (score out of 100)
2. Scores for different categories (technical knowledge, communication, problem-solving)
3. Key strengths (3-5 points)
4. Areas for improvement (3-5 points)
5. Final assessment summary (2-3 sentences)

Format your response as a valid JSON object with the following structure:
{
  "totalScore": 85,
  "categoryScores": [
    {"name": "Technical Knowledge", "score": 80, "comment": "Demonstrated good understanding of core concepts..."},
    {"name": "Communication", "score": 90, "comment": "Articulated ideas clearly and concisely..."},
    {"name": "Problem-Solving", "score": 85, "comment": "Showed strong analytical thinking..."}
  ],
  "strengths": [
    "Strong understanding of fundamental concepts",
    "Clear and concise communication",
    "Good problem-solving approach"
  ],
  "areasForImprovement": [
    "Could provide more detailed examples",
    "Consider discussing more advanced topics",
    "Expand knowledge of [specific area]"
  ],
  "finalAssessment": "Overall, the candidate demonstrated solid skills for the position with particular strengths in communication. With some additional focus on advanced concepts, they would be well-positioned for success."
}

Be fair but critical in your assessment. Base your evaluation only on the interview transcript.

Here are the questions that were prepared for this interview:
${interview.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Now, here is the full interview transcript:
${transcript.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n')}

Please analyze this interview and provide your feedback in the JSON format described.`;

    // Access Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      }
    });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedbackText = response.text();
    
    try {
      // Try to parse the JSON response
      const feedbackJson = JSON.parse(feedbackText);
      return feedbackJson;
    } catch (parseError) {
      console.error("Error parsing feedback JSON:", parseError);
      
      // Attempt to extract JSON using regex if parsing fails
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // If all else fails, return a default feedback structure
        return {
          totalScore: 70,
          categoryScores: [
            { name: "Technical Knowledge", score: 70, comment: "Demonstrated basic understanding of required technologies." },
            { name: "Communication", score: 75, comment: "Communicated ideas with reasonable clarity." },
            { name: "Problem-Solving", score: 65, comment: "Showed some problem-solving capability but could improve." }
          ],
          strengths: [
            "Showed enthusiasm for the role",
            "Demonstrated basic technical knowledge",
            "Responded to all questions"
          ],
          areasForImprovement: [
            "Could provide more detailed technical explanations",
            "Should practice more complex problem scenarios",
            "May benefit from more concise communication"
          ],
          finalAssessment: "The candidate shows potential but would benefit from additional preparation and practice in technical interviews."
        };
      }
    }
  } catch (error) {
    console.error("Error generating feedback:", error);
    throw new Error("Failed to generate interview feedback");
  }
} 