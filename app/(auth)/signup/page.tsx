"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUpWithEmail, loginWithGoogle } from "../login/actions";
import { Loader2, BrainCircuit } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Free",
  description:
    "Create your free Intervu AI account. Practice mock interviews, analyze your resume, and prepare for placement season.",
  robots: { index: true, follow: true },
};

const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onEmailSubmit(data: SignupFormData) {
    setIsEmailLoading(true);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("full_name", data.full_name);

    const result = await signUpWithEmail(formData);

    if (result?.error) {
      toast.error(result.error);
      setIsEmailLoading(false);
      return;
    }

    toast.success("Account created! Welcome to Intervu AI.");
  }

  async function onGoogleLogin() {
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();

    if (result?.error) {
      toast.error(result.error);
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Intervu AI</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Start your interview preparation journey
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Join thousands preparing smarter with AI
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google OAuth */}
            <Button
              variant="outline"
              className="w-full"
              onClick={onGoogleLogin}
              disabled={isGoogleLoading || isEmailLoading}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Signup Form */}
            <form
              onSubmit={handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isEmailLoading || isGoogleLoading}
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="text-destructive text-xs">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isEmailLoading || isGoogleLoading}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isEmailLoading || isGoogleLoading}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isEmailLoading || isGoogleLoading}
                  {...register("confirm_password")}
                />
                {errors.confirm_password && (
                  <p className="text-destructive text-xs">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isEmailLoading || isGoogleLoading}
              >
                {isEmailLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}