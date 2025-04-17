import { FileSearch } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <FileSearch className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No repositories selected</h2>
      <p className="text-muted-foreground max-w-md">
        Search for GitHub repositories and select up to 10 to compare their
        stats, activity, and community metrics.
      </p>
    </div>
  );
}
