import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/prisma";

export default async function FeedbackPage({ params }) {
  // Get the current user
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const id = params.id;

  // Get the interview and feedback by ID
  const interview = await db.aiInterview.findUnique({
    where: {
      id: id,
    },
    include: {
      feedback: true,
    },
  });

  // If interview doesn't exist, doesn't belong to the user, or has no feedback, redirect
  if (!interview || interview.userId !== user.id || !interview.feedback) {
    redirect("/interview/ai-mock");
  }

  const feedback = interview.feedback;
  
  // Format date
  const formattedDate = new Date(feedback.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interview/ai-mock">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to AI Mock Interview
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interview Feedback</h1>
          <p className="text-muted-foreground">
            {interview.role} • {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            Overall Score: {feedback.totalScore}/100
          </span>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${getScoreColorClass(feedback.totalScore)}`}>
            {Math.round(feedback.totalScore)}
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Final Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{feedback.finalAssessment}</p>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid md:grid-cols-2 gap-6">
        {feedback.categoryScores.map((category, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColorClass(category.score)} text-white`}>
                  {category.score}/100
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p>{category.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
            <CardDescription>Key strengths demonstrated during the interview</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {feedback.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>Suggestions to enhance your interview performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-5">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/interview/ai-mock">
            Try Another Interview
          </Link>
        </Button>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Download Feedback
        </Button>
      </div>
    </div>
  );
}

// Helper function to get color class based on score
function getScoreColorClass(score) {
  if (score >= 90) return "bg-green-500";
  if (score >= 75) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
} 