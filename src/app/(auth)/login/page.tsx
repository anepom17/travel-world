"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Ошибка входа", { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success("Добро пожаловать!");
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const displayName = formData.get("displayName") as string;

    if (password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName || undefined },
      },
    });

    if (error) {
      toast.error("Ошибка регистрации", { description: error.message });
      setIsLoading(false);
      return;
    }

    toast.success("Аккаунт создан!", {
      description: "Проверьте почту для подтверждения.",
    });
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-teal-700">
            Travel World
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ваш персональный дневник путешествий
          </p>
        </div>

        <Card>
          <Tabs defaultValue="signin">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Вход</TabsTrigger>
                <TabsTrigger value="signup">Регистрация</TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <CardTitle className="text-lg">Войти в аккаунт</CardTitle>
                  <CardDescription>
                    Введите email и пароль для входа
                  </CardDescription>

                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Пароль</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Вход..." : "Войти"}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <CardTitle className="text-lg">Создать аккаунт</CardTitle>
                  <CardDescription>
                    Заполните данные для регистрации
                  </CardDescription>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Имя</Label>
                    <Input
                      id="signup-name"
                      name="displayName"
                      type="text"
                      placeholder="Путешественник"
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Пароль</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Минимум 6 символов"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Создание..." : "Зарегистрироваться"}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Продолжая, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
