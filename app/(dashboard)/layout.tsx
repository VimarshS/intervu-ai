import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { FeedbackWidget } from "../../components/feedback/FeedbackWidget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("id", user.id)
    .single();

  if (profile && !profile.is_onboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Desktop navbar only */}
        <div className="hidden md:block">
          <Navbar />
        </div>
        {/* 
          Mobile: pt-14 accounts for the fixed mobile header height
          Desktop: no extra padding needed — navbar is in flow
        */}
        <main className="flex-1 pt-14 md:pt-0 px-4 pb-6 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
      <FeedbackWidget />
    </div>
  );
}