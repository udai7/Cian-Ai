import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import InterviewSetup from "./_components/interview-setup";

export default function AiMockInterviewPage() {
  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-col space-y-2 mx-2">
        <Link href="/interview">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation
          </Button>
        </Link>

        <div>
          <h1 className="text-6xl font-bold gradient-title">AI Mock Interview</h1>
          <p className="text-muted-foreground">
            Practice real-time interview scenarios with our AI interviewer and receive detailed feedback
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mx-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Our AI-powered mock interviews simulate real interview conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Real-time Conversation</h3>
                <p className="text-sm text-muted-foreground">
                  Speak directly with our AI interviewer, who adapts questions based on your responses
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Industry-specific Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Questions tailored to your industry, role, and experience level
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Detailed Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Receive comprehensive feedback on your performance, including strengths and areas for improvement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <InterviewSetup />
      </div>
    </div>
  );
} 