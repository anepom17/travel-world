import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";

/**
 * Layout for all protected routes (/dashboard, /trips, /portrait, /settings).
 * Fetches the current user and profile, renders the app header,
 * and makes user context available to child pages.
 */
export default async function ProtectedLayout({
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

  // Fetch profile for display_name and avatar
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const headerUser = {
    email: user.email,
    displayName:
      profile?.display_name ??
      user.user_metadata?.full_name ??
      undefined,
    avatarUrl:
      profile?.avatar_url ??
      user.user_metadata?.avatar_url ??
      undefined,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={headerUser} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
