"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const InterviewSetup = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    interviewType: "mixed",
    experienceLevel: "intermediate",
    role: "software-engineer",
    techStack: [],
  });

  const technologies = [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "react", label: "React" },
    { id: "nodejs", label: "Node.js" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
    { id: "aws", label: "AWS" },
    { id: "docker", label: "Docker" },
    { id: "kubernetes", label: "Kubernetes" },
  ];

  const roles = [
    { id: "software-engineer", label: "Software Engineer" },
    { id: "web-developer", label: "Web Developer" },
    { id: "data-scientist", label: "Data Scientist" },
    { id: "devops-engineer", label: "DevOps Engineer" },
    { id: "product-manager", label: "Product Manager" },
    { id: "ux-designer", label: "UX Designer" },
  ];

  const handleTechStackChange = (techId) => {
    setFormData((prev) => {
      if (prev.techStack.includes(techId)) {
        return {
          ...prev,
          techStack: prev.techStack.filter((id) => id !== techId),
        };
      } else {
        return {
          ...prev,
          techStack: [...prev.techStack, techId],
        };
      }
    });
  };

  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/interview/ai-mock/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success && data.interviewId) {
        router.push(`/interview/ai-mock/${data.interviewId}`);
      } else {
        throw new Error(data.error || "Failed to create interview");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      // You would typically show an error toast/notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Your Interview</CardTitle>
        <CardDescription>
          Customize your mock interview experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="interview-type">Interview Type</Label>
          <Select
            value={formData.interviewType}
            onValueChange={(value) =>
              setFormData({ ...formData, interviewType: value })
            }
          >
            <SelectTrigger id="interview-type">
              <SelectValue placeholder="Select interview type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value })
            }
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience-level">Experience Level</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value) =>
              setFormData({ ...formData, experienceLevel: value })
            }
          >
            <SelectTrigger id="experience-level">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="mb-2 block">Technologies (Select up to 5)</Label>
          <div className="grid grid-cols-2 gap-2">
            {technologies.map((tech) => (
              <div className="flex items-center space-x-2" key={tech.id}>
                <Checkbox
                  id={tech.id}
                  checked={formData.techStack.includes(tech.id)}
                  onCheckedChange={() => handleTechStackChange(tech.id)}
                  disabled={
                    formData.techStack.length >= 5 &&
                    !formData.techStack.includes(tech.id)
                  }
                />
                <Label htmlFor={tech.id}>{tech.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleStartInterview}
          className="w-full"
          disabled={isLoading || formData.techStack.length === 0}
        >
          {isLoading ? "Setting up interview..." : "Start Interview"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewSetup; 