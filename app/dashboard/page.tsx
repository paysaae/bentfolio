import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const userId = claims?.sub;
  if (!userId) redirect("/login?next=/dashboard");

  const { data: profile, error } = await supabase.from("profiles")
    .select("id, username, display_name, headline, bio, city, projects, blocks, is_published")
    .eq("id", userId).maybeSingle();
  if (error || !profile) redirect("/signup");

  return <DashboardClient userId={userId} profile={profile} email={typeof claims.email === "string" ? claims.email : ""}/>;
}
