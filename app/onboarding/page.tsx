"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, Briefcase, Target, Trophy } from "lucide-react";

const onboardingSchema = z.object({
  target_role: z
    .string()
    .min(2, "Please enter your target role")
    .max(100, "Role must be less than 100 characters"),
  target_company: z
    .string()
    .max(100, "Company must be less than 100 characters")
    .optional(),
  experience_level: z.enum(["fresher", "junior", "mid", "senior"] as const, {
    error: "Please select your experience level",
  }),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  {
    id: 1,
    title: "What role are you targeting?",
    description: "This helps us generate relevant interview questions for you.",
    icon: Briefcase,
  },
  {
    id: 2,
    title: "Any specific company in mind?",
    description:
      "We will tailor questions based on the company's interview style.",
    icon: Target,
  },
  {
    id: 3,
    title: "What is your experience level?",
    description: "We will adjust question difficulty to match your level.",
    icon: Trophy,
  },
];

const roleOptions = [
  "Software Development Engineer (SDE)",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Product Manager",
  "Business Analyst",
  "Data Analyst",
  "Mobile Developer",
  "Cloud Engineer",
];

const companyOptions = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Flipkart",
  "Infosys",
  "TCS",
  "Wipro",
  "Startup",
  "Other",
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const watchedRole = watch("target_role");
  const watchedCompany = watch("target_company");
  const watchedLevel = watch("experience_level");

  const progressValue = (currentStep / steps.length) * 100;

  async function handleNext() {
    // Validate only the current step's field
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger("target_role");
    } else if (currentStep === 2) {
      // Company is optional — always valid
      isValid = true;
    } else if (currentStep === 3) {
      isValid = await trigger("experience_level");
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  async function onSubmit(data: OnboardingFormData) {
    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          target_role: data.target_role,
          target_company: data.target_company ?? null,
          experience_level: data.experience_level,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to save profile. Please try again.");
        setIsLoading(false);
        return;
      }

      toast.success("Profile set up! Let's start preparing.");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  const currentStepData = steps[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold">Intervu AI</span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Setting up your profile</span>
            <span>Step {currentStep} of {steps.length}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <Card>
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <StepIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">
              {currentStepData.title}
            </CardTitle>
            <CardDescription>
              {currentStepData.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Step 1 — Target Role */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <Label htmlFor="target_role">Target Role</Label>
                  <Input
                    id="target_role"
                    placeholder="e.g. Software Development Engineer"
                    {...register("target_role")}
                  />
                  {errors.target_role && (
                    <p className="text-destructive text-xs">
                      {errors.target_role.message}
                    </p>
                  )}
                  {/* Quick select options */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {roleOptions.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setValue("target_role", role)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          watchedRole === role
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent border-border text-muted-foreground"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 — Target Company */}
              {currentStep === 2 && (
                <div className="space-y-3">
                  <Label htmlFor="target_company">
                    Target Company{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="target_company"
                    placeholder="e.g. Google, Amazon, any startup..."
                    {...register("target_company")}
                  />
                  {/* Quick select options */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {companyOptions.map((company) => (
                      <button
                        key={company}
                        type="button"
                        onClick={() => setValue("target_company", company)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          watchedCompany === company
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent border-border text-muted-foreground"
                        }`}
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 — Experience Level */}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <Label>Experience Level</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue(
                        "experience_level",
                        value as OnboardingFormData["experience_level"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fresher">
                        Fresher — 0 years experience
                      </SelectItem>
                      <SelectItem value="junior">
                        Junior — 1 to 2 years experience
                      </SelectItem>
                      <SelectItem value="mid">
                        Mid-level — 3 to 5 years experience
                      </SelectItem>
                      <SelectItem value="senior">
                        Senior — 5+ years experience
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience_level && (
                    <p className="text-destructive text-xs">
                      {errors.experience_level.message}
                    </p>
                  )}

                  {/* Summary of selections */}
                  {watchedLevel && (
                    <div className="rounded-lg bg-muted p-4 space-y-2 mt-4">
                      <p className="text-sm font-medium">
                        Your profile summary
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium text-foreground">
                            Role:
                          </span>{" "}
                          {watchedRole || "Not set"}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Company:
                          </span>{" "}
                          {watchedCompany || "Any company"}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">
                            Level:
                          </span>{" "}
                          {watchedLevel}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  disabled={currentStep === 1 || isLoading}
                >
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isLoading}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Complete Setup"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}