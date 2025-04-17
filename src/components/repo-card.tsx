import {
  formatDate,
  getRepositoryDetails,
  type Repository,
  type RepositoryDetails,
} from "@/lib/github-api";
import {
  Loader2,
  Star,
  GitFork,
  Eye,
  MessageSquare,
  Clock,
  FileCode,
  GitCommit,
  GitPullRequest,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import type { Repo } from "@/types/common";
import { Badge } from "./ui/badge";
import useSWR from "swr";
import {
  getCommitFrequencyClass,
  getMetricClass,
  getMetricLabel,
  getCommitFrequencyLabel,
} from "@/lib/utils";
import ProgressBar from "./progress-bar";
interface RepoCardProps {
  repo: Repository;
  mode: "overview" | "activity" | "community" | "code";
}

interface RepoDetailsProps {
  repoDetails: RepositoryDetails;
}

async function fetchRepoDetails(repo: Repo) {
  try {
    const details = await getRepositoryDetails(repo.owner.login, repo.name);
    return details;
  } catch (error) {
    console.error(
      `Error fetching details for ${repo.owner.login}/${repo.name}:`,
      error
    );
    throw error;
  }
}

const CommunityCard = ({ repoDetails }: RepoDetailsProps) => {
  return (
    <Card className="overflow-hidden card-hover-effect">
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {repoDetails.name}
        </CardTitle>
        <CardDescription>Community metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Open issues</span>
            </div>
            <span>{repoDetails.open_issues_count.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitPullRequest className="h-4 w-4" />
              <span className="text-sm">Open PRs</span>
            </div>
            <span>
              {repoDetails.open_pull_requests !== undefined
                ? repoDetails.open_pull_requests.toLocaleString()
                : "-"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">Contributors</span>
            </div>
            <span>{repoDetails.contributors_count.toLocaleString()}</span>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">Community engagement</span>
              </div>
              <span className="text-sm font-medium">
                {getMetricLabel(repoDetails.community_engagement)}
              </span>
            </div>
            <ProgressBar
              percentage={repoDetails.community_engagement}
              className={getMetricClass(repoDetails.community_engagement)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CodeCard = ({ repoDetails }: RepoDetailsProps) => {
  return (
    <Card className="overflow-hidden card-hover-effect">
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {repoDetails.name}
        </CardTitle>
        <CardDescription>Code metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">Code quality</span>
              </div>
              <span className="text-sm font-medium">
                {getMetricLabel(repoDetails.code_quality)}
              </span>
            </div>
            <ProgressBar
              percentage={repoDetails.code_quality}
              className={getMetricClass(repoDetails.code_quality)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">Documentation</span>
              </div>
              <span className="text-sm font-medium">
                {getMetricLabel(repoDetails.documentation_quality)}
              </span>
            </div>
            <ProgressBar
              percentage={repoDetails.documentation_quality}
              className={getMetricClass(repoDetails.documentation_quality)}
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">Test coverage</span>
              </div>
              <span className="text-sm font-medium">
                {getMetricLabel(repoDetails.test_coverage)}
              </span>
            </div>
            <ProgressBar
              percentage={repoDetails.test_coverage}
              className={getMetricClass(repoDetails.test_coverage)}
            />
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Primary language</h4>
            <div className="flex gap-2">
              {repoDetails.language ? (
                <Badge variant="secondary">{repoDetails.language}</Badge>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Not specified
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ActivityCard = ({ repoDetails }: RepoDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {repoDetails.name}
        </CardTitle>
        <CardDescription>Activity metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">Commit frequency</span>
              </div>
              <span className="text-sm font-medium flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                {repoDetails.commit_frequency}/week
              </span>
            </div>
            <ProgressBar
              percentage={repoDetails.commit_frequency}
              className={getCommitFrequencyClass(repoDetails.commit_frequency)}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {getCommitFrequencyLabel(repoDetails.commit_frequency)} activity
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-sm">Issue resolution</span>
              </div>
              <span className="text-sm font-medium">
                {getMetricLabel(repoDetails.issue_resolution_time)}
              </span>
            </div>
            <ProgressBar
              percentage={repoDetails.issue_resolution_time}
              className={getMetricClass(repoDetails.issue_resolution_time)}
            />
          </div>
          {repoDetails.median_issue_resolution_days !== undefined && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              ~{repoDetails.median_issue_resolution_days} days median
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <div className="flex items-center gap-1">
              <span className="text-sm">PR review time</span>
            </div>
            <span className="text-sm font-medium">
              {getMetricLabel(repoDetails.pr_review_time)}
            </span>
          </div>
          <ProgressBar
            percentage={repoDetails.pr_review_time}
            className={getMetricClass(repoDetails.pr_review_time)}
          />
          {repoDetails.median_pr_review_days !== undefined && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              ~{repoDetails.median_pr_review_days} days median
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const OverviewCard = ({ repoDetails }: RepoDetailsProps) => {
  return (
    <Card className="overflow-hidden card-hover-effect">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              <a
                href={repoDetails.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-primary"
              >
                {repoDetails.name}
              </a>
            </CardTitle>
            <CardDescription>{repoDetails.owner.login}</CardDescription>
          </div>
          {repoDetails.language && (
            <Badge variant="outline">{repoDetails.language}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {repoDetails.description || "No description available"}
        </p>

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <span>{repoDetails.stargazers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <GitFork className="h-4 w-4" />
            <span>{repoDetails.forks_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{repoDetails.watchers_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{repoDetails.open_issues_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Updated {formatDate(repoDetails.updated_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span>{repoDetails.license?.name || "No license"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingCard = () => {
  return (
    <Card className="overflow-hidden card-hover-effect">
      <CardContent className="p-6 flex items-center justify-center h-[250px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading repository data...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const ErrorCard = ({ error }: { error: string }) => {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-center h-[250px]">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const RepoCard = ({ repo, mode }: RepoCardProps) => {
  const { data, error, isLoading } = useSWR(repo, fetchRepoDetails);

  return (
    <>
      {isLoading ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard error={error} />
      ) : data ? (
        <>
          {mode === "overview" && <OverviewCard repoDetails={data} />}
          {mode === "activity" && <ActivityCard repoDetails={data} />}
          {mode === "community" && <CommunityCard repoDetails={data} />}
          {mode === "code" && <CodeCard repoDetails={data} />}
        </>
      ) : null}
    </>
  );
};
