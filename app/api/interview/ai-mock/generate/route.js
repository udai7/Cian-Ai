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
    const { interviewType, experienceLevel, role, techStack } = await req.json();

    if (!interviewType || !experienceLevel || !role || !techStack?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate questions using Gemini
    const questions = await generateQuestions(
      interviewType,
      experienceLevel,
      role,
      techStack
    );

    // Create a new interview in the database
    const interview = await db.aiInterview.create({
      data: {
        userId: user.id,
        type: interviewType,
        role: formatRole(role),
        level: experienceLevel,
        techStack: techStack,
        questions: questions,
        status: "pending",
      },
    });

    return NextResponse.json(
      { success: true, interviewId: interview.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating AI interview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create interview" },
      { status: 500 }
    );
  }
}

// Helper function to generate questions
async function generateQuestions(type, level, role, techStack) {
  try {
    const formattedTechStack = techStack.join(", ");
    const roleLabel = formatRole(role);
    
    const prompt = `Generate 8-10 interview questions for a ${level} ${roleLabel} position.
    The interview type should focus on ${type} questions.
    The candidate has experience with: ${formattedTechStack}.
    
    Please return only the questions in a valid JSON array format, like this:
    ["Question 1", "Question 2", "Question 3"]
    
    The questions should be challenging but appropriate for the experience level.`;

    // Access Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Extract and parse the JSON array of questions from the response
    const questionsMatch = responseText.match(/\[.*\]/s);
    
    if (questionsMatch) {
      return JSON.parse(questionsMatch[0]);
    } else {
      // Fallback in case the model doesn't return properly formatted JSON
      try {
        return JSON.parse(responseText);
      } catch (error) {
        // If we can't parse JSON, extract questions manually
        const lines = responseText.split('\n');
        const questions = lines
          .filter(line => line.trim().startsWith('"') || line.trim().startsWith('- '))
          .map(line => {
            // Remove list markers, quotation marks, and trim
            return line.replace(/^-\s+/, '').replace(/^"/, '').replace(/",$/, '').replace(/"$/, '').trim();
          })
          .filter(q => q.length > 0);
        
        return questions.length > 0 ? questions : ["Tell me about yourself and your experience.", "What are your strengths and weaknesses?"];
      }
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate interview questions");
  }
}

// Format role for display
function formatRole(roleId) {
  return roleId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
} 