"use client";

import type React from "react";
import type { Repository } from "../lib/github-api";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Loader2,
  Info,
  GitBranch,
  Star,
  Code,
  ArrowUp,
} from "lucide-react";
import { searchRepositories } from "../lib/github-api";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComparisonSection } from "@/components/comparison-section";
import { EmptyState } from "@/components/empty-state";
import { SearchResults } from "@/components/search-results";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{
    remaining: string | null;
    limit: string | null;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const results = await searchRepositories(searchQuery);
      setSearchResults(results.items);

      // Set rate limit information if available
      if (results._rateLimit) {
        setRateLimit(results._rateLimit);
      }
    } catch (err) {
      setError("Failed to search repositories. Please try again.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const addRepository = (repo: Repository) => {
    if (selectedRepos.length >= 10) return;
    if (selectedRepos.some((r) => r.id === repo.id)) return;

    setSelectedRepos([...selectedRepos, repo]);
    // Clear search results after selection
    setSearchResults([]);
    setSearchQuery("");

    // Focus the search input after adding a repository
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const removeRepository = (repoId: number) => {
    setSelectedRepos(selectedRepos.filter((repo) => repo.id !== repoId));
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for a GitHub repository (e.g., 'react', 'tailwindcss')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-input"
            ref={searchInputRef}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Search
        </Button>
      </form>

      {rateLimit && (
        <div className="mt-2 flex items-center justify-end text-xs text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center cursor-help">
                  <Info className="h-3 w-3 mr-1" />
                  API Rate Limit: {rateLimit.remaining}/{rateLimit.limit}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  GitHub API requests remaining. Using authenticated requests
                  with GITHUB_TOKEN.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <SearchResults results={searchResults} onSelect={addRepository} />
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Selected Repositories</h2>
          <span className="text-xs bg-secondary/50 px-2 py-1 rounded-full text-muted-foreground">
            {selectedRepos.length}/10 selected
          </span>
        </div>

        {selectedRepos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/5">
            <div className="bg-primary/10 p-3 rounded-full mb-3">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              No repositories selected yet
            </p>
            <div className="flex items-center text-xs text-muted-foreground gap-1">
              <ArrowUp className="h-3 w-3 animate-bounce" />
              <span>
                Use the search form above to find and add repositories
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedRepos.map((repo) => (
              <div
                key={repo.id}
                className="relative group overflow-hidden rounded-lg border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/20"
              >
                {/* Tech-inspired decorative element */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl" />

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-primary/20" />

                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {repo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {repo.owner.login}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2 -mr-1 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRepository(repo.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    {repo.language && (
                      <Badge
                        variant="outline"
                        className="bg-primary/5 border-primary/20"
                      >
                        <Code className="h-3 w-3 mr-1" /> {repo.language}
                      </Badge>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      {repo.stargazers_count.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}

            {/* Informational element when less than 10 repos are selected */}
            {selectedRepos.length < 10 && (
              <div className="flex items-center justify-center h-[104px] border border-dashed rounded-lg bg-muted/5">
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUp className="h-3 w-3" />
                    <span>Search above to add more repositories</span>
                    <ArrowUp className="h-3 w-3" />
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    You can add up to {10 - selectedRepos.length} more
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedRepos.length > 0 ? (
        <ComparisonSection repositories={selectedRepos} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
