"use client";

import type { Repository } from "../lib/github-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  results: Repository[];
  onSelect: (repo: Repository) => void;
}

export function SearchResults({ results, onSelect }: SearchResultsProps) {
  return (
    <div className="mt-4 space-y-2 max-h-80 overflow-y-auto p-1 rounded-md">
      {results.map((repo) => (
        <Card key={repo.id} className="hover:bg-accent/5 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{repo.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    by {repo.owner.login}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {repo.description || "No description available"}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="ml-2"
                onClick={() => onSelect(repo)}
              >
                Add
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {repo.language && (
                <Badge variant="outline" className="text-xs">
                  {repo.language}
                </Badge>
              )}
              <div className="flex items-center text-xs text-muted-foreground">
                <Star className="h-3 w-3 mr-1" />
                {repo.stargazers_count.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
