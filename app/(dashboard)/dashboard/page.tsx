import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BrainCircuit, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/(auth)/login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile from our profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      {/* Temporary Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Intervu AI</span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </nav>

      {/* Placeholder Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">
            Welcome back
            {profile?.full_name ? `, ${profile.full_name}` : ""}
            ! 👋
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered interview preparation dashboard
          </p>
        </div>

        {/* Auth verification card */}
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <h2 className="font-semibold text-lg">
            ✅ Authentication Working
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">User ID:</span>{" "}
              {user.id}
            </p>
            <p>
              <span className="font-medium text-foreground">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-medium text-foreground">Full Name:</span>{" "}
              {profile?.full_name ?? "Not set yet"}
            </p>
            <p>
              <span className="font-medium text-foreground">
                Profile Created:
              </span>{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleString()
                : "Pending"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-semibold text-lg mb-2">🚧 Coming Soon</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>→ Profile setup and onboarding</li>
            <li>→ AI mock interview sessions</li>
            <li>→ Resume analyzer</li>
            <li>→ Progress tracking</li>
            <li>→ Coding practice module</li>
          </ul>
        </div>
      </main>
    </div>
  );
}