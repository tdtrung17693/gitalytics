"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  GitFork,
  Eye,
  Users,
  Clock,
  FileCode,
  MessageSquare,
  GitPullRequest,
  Loader2,
  AlertCircle,
  GitCommit,
  BarChart,
} from "lucide-react";
import type { Repository, RepositoryDetails } from "@/lib/github-api";
import { getRepositoryDetails, formatDate } from "@/lib/github-api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RepoCard } from "./repo-card";

interface ComparisonSectionProps {
  repositories: Repository[];
}

export function ComparisonSection({ repositories }: ComparisonSectionProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [repoDetails, setRepoDetails] = useState<
    Record<number, RepositoryDetails>
  >({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  // Check if any repositories have errors
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="mt-8">
      {hasErrors && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some repository data couldn't be loaded completely. The displayed
            metrics might be incomplete.
          </AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <RepoCard
                key={`${repo.id}-overview`}
                repo={repo}
                mode="overview"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="mb-6 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  How Activity Metrics Are Calculated
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Commit Frequency</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Average weekly commits over the last 3 months</li>
                    <li>30+ commits/week = Very High</li>
                    <li>15+ commits/week = High</li>
                    <li>5+ commits/week = Medium</li>
                    <li>2+ commits/week = Low</li>
                    <li>&lt;2 commits/week = Very Low</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Issue Resolution</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Based on median days to close issues</li>
                    <li>&lt;1 day = Excellent (100)</li>
                    <li>1 week = High (70)</li>
                    <li>2 weeks = Medium (50)</li>
                    <li>1 month = Low (30)</li>
                    <li>&gt;2 months = Very Low (0)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">PR Review Time</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Based on median days to merge PRs</li>
                    <li>&lt;1 day = Excellent (100)</li>
                    <li>3 days = Very High (80)</li>
                    <li>1 week = High (60)</li>
                    <li>2 weeks = Medium (40)</li>
                    <li>&gt;3 weeks = Very Low (0)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <RepoCard
                key={`${repo.id}-activity`}
                repo={repo}
                mode="activity"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community">
          <Card className="mb-6 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  How Community Metrics Are Calculated
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  Community Engagement Score
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  A weighted score combining multiple factors to measure overall
                  community activity and interest:
                </p>
                <div className="grid gap-2 md:grid-cols-5">
                  <div className="bg-muted/40 rounded p-2 text-center">
                    <div className="text-xs text-muted-foreground">Stars</div>
                    <div className="font-medium text-sm">25%</div>
                  </div>
                  <div className="bg-muted/40 rounded p-2 text-center">
                    <div className="text-xs text-muted-foreground">Forks</div>
                    <div className="font-medium text-sm">20%</div>
                  </div>
                  <div className="bg-muted/40 rounded p-2 text-center">
                    <div className="text-xs text-muted-foreground">
                      Watchers
                    </div>
                    <div className="font-medium text-sm">10%</div>
                  </div>
                  <div className="bg-muted/40 rounded p-2 text-center">
                    <div className="text-xs text-muted-foreground">
                      Contributors
                    </div>
                    <div className="font-medium text-sm">25%</div>
                  </div>
                  <div className="bg-muted/40 rounded p-2 text-center">
                    <div className="text-xs text-muted-foreground">
                      Commit Activity
                    </div>
                    <div className="font-medium text-sm">20%</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Each factor is normalized against typical values for popular
                  repositories. Higher scores indicate more active and engaged
                  communities.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <RepoCard
                key={`${repo.id}-community`}
                repo={repo}
                mode="community"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="code">
          <Card className="mb-6 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  How Code Quality Metrics Are Calculated
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Code Quality</h4>
                  <p className="text-sm text-muted-foreground">
                    Starting with a base score of 50, we add:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Commit consistency (up to 15 points)</li>
                    <li>Repository maturity (up to 10 points)</li>
                    <li>Low issues-to-forks ratio (up to 10 points)</li>
                    <li>Stars as community validation (up to 15 points)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Documentation</h4>
                  <p className="text-sm text-muted-foreground">
                    Starting with a base score of 40, we add:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Wiki presence (10 points)</li>
                    <li>Description quality (up to 10 points)</li>
                    <li>Website presence (10 points)</li>
                    <li>README size estimation (up to 15 points)</li>
                    <li>Stars as community validation (up to 15 points)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Test Coverage</h4>
                  <p className="text-sm text-muted-foreground">
                    Starting with a base score of 30, we add:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                    <li>Repository size (up to 20 points)</li>
                    <li>Repository age (up to 15 points)</li>
                    <li>Stars as community validation (up to 20 points)</li>
                    <li>Forks (up to 15 points)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => (
              <RepoCard key={`${repo.id}-code`} repo={repo} mode="code" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
