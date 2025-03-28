import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/prisma";
import AIInterviewAgent from "../_components/ai-interview-agent";

export default async function InterviewPage({ params }) {
  // Get the current user
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const id = params.id;

  // Get the interview by ID
  const interview = await db.aiInterview.findUnique({
    where: {
      id: id,
    },
  });

  // If interview doesn't exist or doesn't belong to the user, redirect
  if (!interview || interview.userId !== user.id) {
    redirect("/interview/ai-mock");
  }

  // Check if feedback already exists
  const feedback = await db.interviewFeedback.findUnique({
    where: {
      interviewId: interview.id,
    },
  });

  // If feedback exists, redirect to the feedback page
  if (feedback) {
    redirect(`/interview/ai-mock/${interview.id}/feedback`);
  }

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
          <h1 className="text-3xl font-bold">{interview.role} Interview</h1>
          <p className="text-muted-foreground">
            {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} • {interview.level.charAt(0).toUpperCase() + interview.level.slice(1)} Level
          </p>
        </div>
        <div className="flex gap-2">
          {interview.techStack.map((tech) => (
            <span
              key={tech}
              className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <AIInterviewAgent 
          userName={user.fullName || user.username || "User"}
          userId={user.id}
          interviewId={interview.id}
          questions={interview.questions}
        />
      </div>
    </div>
  );
} 