import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { CreditsDisplay } from "../credits/CreditsDisplay";

export async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email, target_role")
    .eq("id", user?.id ?? "")
    .single();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
     {/* Left — context + credits */}
<div className="flex items-center gap-3">
  {profile?.target_role && (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
      <span className="text-xs text-slate-300 font-medium">
        {profile.target_role}
      </span>
    </div>
  )}
  <CreditsDisplay />
</div>

      {/* Right — user menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
  <Button
    variant="ghost"
    className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-slate-800 transition-colors"
  >
    <Avatar className="h-7 w-7 ring-2 ring-slate-700">
      <AvatarImage
        src={profile?.avatar_url ?? ""}
        alt={profile?.full_name ?? "User"}
      />
      <AvatarFallback className="text-xs font-semibold bg-indigo-500/20 text-indigo-300">
        {initials}
      </AvatarFallback>
    </Avatar>
    {/* Show initials/name on mobile too — truncated */}
    <div className="flex flex-col items-start max-w-[100px] sm:max-w-none">
      <span className="text-xs font-medium text-slate-200 leading-none truncate w-full">
        {profile?.full_name
          ? profile.full_name.split(" ")[0]
          : profile?.email?.split("@")[0] ?? "User"}
      </span>
      <span className="hidden sm:block text-xs text-slate-500 leading-none mt-0.5 truncate w-full">
        {profile?.email ?? user?.email}
      </span>
    </div>
  </Button>
</DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-56 bg-slate-900 border-slate-700"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-slate-200 leading-none">
                {profile?.full_name ?? "User"}
              </p>
              <p className="text-xs text-slate-500 leading-none mt-1">
                {profile?.email ?? user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-slate-700" />

          <DropdownMenuItem
            asChild
            className="text-slate-300 focus:bg-slate-800 focus:text-slate-100 cursor-pointer"
          >
            <Link href="/profile">
              <Settings className="mr-2 h-4 w-4 text-slate-400" />
              Profile Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="text-slate-300 focus:bg-slate-800 focus:text-slate-100 cursor-pointer"
          >
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4 text-slate-400" />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-slate-700" />

<form action={signOut} className="w-full">
  <button
    type="submit"
    className="w-full flex items-center px-2 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-sm cursor-pointer transition-colors"
  >
    <LogOut className="mr-2 h-4 w-4" />
    Sign Out
  </button>
</form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}