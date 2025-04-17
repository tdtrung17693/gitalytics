import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <header className="mb-12 text-center pt-16">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Gitlytics</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
          Compare GitHub repositories to find the right open-source library for
          your project
        </p>
      </header>

      <div className="max-w-3xl mx-auto mb-12">
        <SearchForm />
      </div>
    </main>
  );
}
