"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Globe,
  Globe2,
  LayoutDashboard,
  Map,
  Sparkles,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  user: {
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/trips", label: "Мои поездки", icon: Map },
  { href: "/countries", label: "Мои страны", icon: Globe2 },
  { href: "/portrait", label: "Портрет", icon: Sparkles },
];

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = (user.displayName || user.email || "U")
    .split(/[\s@]+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Ошибка выхода", { description: error.message });
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-primary transition-colors hover:text-primary/80"
        >
          <Globe className="size-5" />
          <span className="hidden sm:inline">Travel World</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <Link key={href} href={href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-1.5 text-sm",
                    isActive && "font-medium text-primary"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative size-8 rounded-full"
              aria-label="Меню пользователя"
            >
              <Avatar className="size-8">
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.displayName || "Avatar"}
                />
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col gap-0.5 px-2 py-1.5">
              {user.displayName && (
                <p className="text-sm font-medium">{user.displayName}</p>
              )}
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer gap-2">
                <UserIcon className="size-4" />
                Настройки
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
