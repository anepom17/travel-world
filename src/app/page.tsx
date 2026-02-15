import Link from "next/link";
import { Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-teal-50 via-white to-amber-50">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
            <Globe className="size-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-teal-800 sm:text-5xl">
            Travel World
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Ваш персональный дневник путешествий: карта мира, фотоальбомы поездок
            и ИИ-портрет путешественника.
          </p>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Начать путешествие
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
