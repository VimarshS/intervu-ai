"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ExperienceLevel } from "@/types/database";

export interface ProfileStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  bestScore: number | null;
  readinessScore: number;
  readinessLabel: string;
  readinessColor: string;
}

export interface ProfileUpdates {
  full_name?: string | null;
  target_role?: string | null;
  target_company?: string | null;
  experience_level?: ExperienceLevel | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  bio?: string | null;
  skills?: string[] | null;
  interview_goal?: string | null;
}

function calculateReadiness(
  completedSessions: number,
  averageScore: number | null,
  bestScore: number | null
): { score: number; label: string; color: string } {
  if (completedSessions === 0) {
    return {
      score: 0,
      label: "Not started — complete your first interview",
      color: "text-slate-400",
    };
  }

  let score = 0;
  score += Math.min(completedSessions * 4, 40);
  if (averageScore !== null) {
    score += Math.round((averageScore / 10) * 40);
  }
  if (bestScore !== null) {
    score += Math.round((bestScore / 10) * 20);
  }
  score = Math.min(score, 100);

  let label = "";
  let color = "";

  if (score >= 80) {
    label = "Interview ready — you are well prepared";
    color = "text-emerald-400";
  } else if (score >= 60) {
    label = "Getting there — keep practicing consistently";
    color = "text-indigo-400";
  } else if (score >= 40) {
    label = "Building momentum — more practice needed";
    color = "text-amber-400";
  } else if (score >= 20) {
    label = "Early stage — complete more sessions";
    color = "text-orange-400";
  } else {
    label = "Just starting — keep going";
    color = "text-slate-400";
  }

  return { score, label, color };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfileAndStats() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError) {
          setError("Failed to load profile");
          return;
        }

        setProfile(profileData as Profile);

        const { data: sessions } = await supabase
          .from("interview_sessions")
          .select("id, status, total_score")
          .eq("user_id", user.id);

        const completed =
          sessions?.filter((s) => s.status === "completed") ?? [];

        const scores = completed
          .map((s) => s.total_score)
          .filter((s): s is number => s !== null);

        const averageScore =
          scores.length > 0
            ? Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
              )
            : null;

        const bestScore =
          scores.length > 0 ? Math.max(...scores) : null;

        const readiness = calculateReadiness(
          completed.length,
          averageScore,
          bestScore
        );

        setStats({
          totalSessions: sessions?.length ?? 0,
          completedSessions: completed.length,
          averageScore,
          bestScore,
          readinessScore: readiness.score,
          readinessLabel: readiness.label,
          readinessColor: readiness.color,
        });
      } catch {
        setError("Something went wrong loading profile");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileAndStats();
  }, []);

  async function updateProfile(
    updates: ProfileUpdates
  ): Promise<{ error: string | null }> {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { error: "Not authenticated" };

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) return { error: error.message };

      setProfile((prev) =>
        prev ? ({ ...prev, ...updates } as Profile) : prev
      );

      return { error: null };
    } catch {
      return { error: "Failed to update profile" };
    }
  }

  async function changePassword(
    newPassword: string
  ): Promise<{ error: string | null }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: "Failed to change password" };
    }
  }

  async function deleteAccount(): Promise<{ error: string | null }> {
    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return { error: "Not authenticated" };

      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (deleteError) return { error: deleteError.message };

      await supabase.auth.signOut();
      return { error: null };
    } catch {
      return { error: "Failed to delete account" };
    }
  }

  return {
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    changePassword,
    deleteAccount,
    setProfile,
  };
}