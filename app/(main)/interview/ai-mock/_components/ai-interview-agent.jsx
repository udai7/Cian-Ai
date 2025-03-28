"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { vapi } from "@/lib/vapi.sdk";
import { toast } from "sonner";

export default function AIInterviewAgent({ userName, userId, interviewId, questions }) {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState("INACTIVE"); // INACTIVE, CONNECTING, ACTIVE, FINISHED
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus("ACTIVE");
    };

    const onCallEnd = () => {
      setCallStatus("FINISHED");
    };

    const onMessage = (message) => {
      console.log("Message received:", message);
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error) => {
      console.error("VAPI Error:", error);
      toast.error("There was an error with the voice connection");
      setCallStatus("INACTIVE");
    };

    // Add event listeners if vapi exists and has event methods
    if (vapi && typeof vapi.on === 'function') {
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("error", onError);

      return () => {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("message", onMessage);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("error", onError);
      };
    }
    
    return () => {};
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages) => {
      try {
        const response = await fetch("/api/interview/ai-mock/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
            transcript: messages,
          }),
        });
        
        const data = await response.json();
        
        if (data.success && data.feedbackId) {
          toast.success("Interview completed! Viewing feedback...");
          router.push(`/interview/ai-mock/${interviewId}/feedback`);
        } else {
          throw new Error(data.error || "Failed to generate feedback");
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("There was an error generating your feedback");
      }
    };

    if (callStatus === "FINISHED") {
      handleGenerateFeedback(messages);
    }
  }, [messages, callStatus, interviewId, router]);

  const handleCall = async () => {
    setCallStatus("CONNECTING");

    try {
      // Format questions for the VAPI workflow
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
      console.log("VAPI Workflow ID available:", !!workflowId);
      
      if (!workflowId) {
        throw new Error("VAPI Workflow ID is not available");
      }

      // Check if vapi exists and has start method
      if (!vapi || typeof vapi.start !== 'function') {
        throw new Error("VAPI client is not properly initialized");
      }

      // Start the VAPI call
      await vapi.start(workflowId, {
        variableValues: {
          questions: formattedQuestions,
          userName: userName,
          userId: userId,
          interviewId: interviewId,
        },
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start the interview call");
      setCallStatus("INACTIVE");
    }
  };

  const handleDisconnect = () => {
    if (vapi && typeof vapi.stop === 'function') {
      vapi.stop();
    }
    setCallStatus("FINISHED");
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Interview Agent UI */}
      <div className="flex w-full justify-center gap-20">
        {/* AI Interviewer */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="bg-primary/10 rounded-full p-6">
              <Image
                src="/ai-avatar.png"
                alt="AI Interviewer"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            {isSpeaking && (
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
          <h3 className="mt-2 font-medium">AI Interviewer</h3>
        </div>
        
        {/* User/Candidate */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="bg-secondary/10 rounded-full p-6">
              <Image
                src="/user-avatar.png"
                alt="User"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            {callStatus === "ACTIVE" && !isSpeaking && (
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
            )}
          </div>
          <h3 className="mt-2 font-medium">{userName}</h3>
        </div>
      </div>
      
      {/* Transcript/Conversation */}
      {messages.length > 0 && (
        <div className="w-full max-h-[400px] overflow-y-auto rounded-lg border p-4">
          <div className="space-y-4">
            <p className="text-center font-medium mb-4">Last Message</p>
            <div className="p-3 rounded-lg bg-muted/50">
              <p>{lastMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex justify-center gap-4">
        {callStatus === "INACTIVE" || callStatus === "FINISHED" ? (
          <Button 
            onClick={handleCall} 
            size="lg" 
            className="gap-2"
          >
            Start Interview Call
          </Button>
        ) : callStatus === "CONNECTING" ? (
          <Button 
            disabled 
            size="lg" 
            className="gap-2"
          >
            Connecting...
          </Button>
        ) : (
          <Button 
            onClick={handleDisconnect} 
            variant="destructive" 
            size="lg"
          >
            End Call
          </Button>
        )}
      </div>
      
      {/* Question info */}
      {callStatus === "ACTIVE" && questions && questions.length > 0 && (
        <div className="w-full p-4 rounded-lg bg-muted/50 mt-4">
          <p className="text-sm font-medium">Interview Guide:</p>
          <p className="text-muted-foreground">The AI interviewer will ask questions based on your role and tech stack.</p>
        </div>
      )}
    </div>
  );
} 