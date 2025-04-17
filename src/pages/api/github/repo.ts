import type { RepositoryDetails } from "@/lib/github-api";
import type { APIRoute } from "astro";
export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return new Response(
      JSON.stringify({ error: "Owner and repo parameters are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Set up headers with GitHub token if available
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  // Add authorization header if GITHUB_TOKEN is available
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Fetch basic repository data
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!repoResponse.ok) {
      const error = await repoResponse.json();
      return new Response(JSON.stringify({ error: error.message }), {
        status: repoResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const repoData = await repoResponse.json();

    // Fetch contributors count
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=1`,
      { headers }
    );

    let contributorsCount = 0;
    if (contributorsResponse.ok) {
      const linkHeader = contributorsResponse.headers.get("Link") || "";
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      contributorsCount = match ? Number.parseInt(match[1], 10) : 1;
    }

    // Fetch commit activity for more precise commit frequency
    let commitFrequency = 0;
    let weeklyCommits: number[] = [];
    try {
      // First try to get participation stats which shows commits by owner vs. non-owner
      const participationResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stats/participation`,
        {
          headers,
        }
      );

      if (participationResponse.ok) {
        const participationData = await participationResponse.json();

        if (
          participationData &&
          participationData.all &&
          Array.isArray(participationData.all)
        ) {
          // Get the last 12 weeks of data (3 months)
          const recentWeeks = participationData.all.slice(-12);
          weeklyCommits = recentWeeks;

          // Calculate average weekly commits
          const totalCommits = recentWeeks.reduce(
            (sum: number, count: number) => sum + count,
            0
          );
          commitFrequency = Math.round(totalCommits / recentWeeks.length);
        }
      }

      // If participation data didn't work, fall back to commit activity
      if (commitFrequency === 0) {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
          {
            headers,
          }
        );

        if (commitsResponse.ok) {
          const commitsData = await commitsResponse.json();

          // Check if commitsData is an array before using array methods
          if (Array.isArray(commitsData) && commitsData.length > 0) {
            // Calculate average weekly commits over the last 3 months (12 weeks or less if fewer weeks are available)
            const weeksToAnalyze = Math.min(12, commitsData.length);
            const recentCommits = commitsData.slice(0, weeksToAnalyze);
            weeklyCommits = recentCommits.map((week: any) => week.total);
            const totalCommits = weeklyCommits.reduce(
              (sum: number, count: number) => sum + count,
              0
            );
            commitFrequency = Math.round(totalCommits / weeksToAnalyze);
          }
        }
      }

      // If we still don't have commit frequency, estimate based on repo age and activity
      if (commitFrequency === 0) {
        const createdDate = new Date(repoData.created_at);
        const now = new Date();
        const ageInWeeks = Math.max(
          1,
          Math.floor(
            (now.getTime() - createdDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          )
        );
        commitFrequency = Math.max(
          1,
          Math.round(repoData.stargazers_count / (ageInWeeks * 10)) || 1
        );
      }
    } catch (error) {
      console.error("Error fetching commit activity:", error);
      // Fallback: estimate commit frequency based on stars and age
      const createdDate = new Date(repoData.created_at);
      const now = new Date();
      const ageInWeeks = Math.max(
        1,
        Math.floor(
          (now.getTime() - createdDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
      );
      commitFrequency = Math.max(
        1,
        Math.round(repoData.stargazers_count / (ageInWeeks * 10)) || 1
      );
    }

    // Fetch pull requests
    const pullRequestsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=1`,
      { headers }
    );

    let openPullRequests = 0;
    if (pullRequestsResponse.ok) {
      const linkHeader = pullRequestsResponse.headers.get("Link") || "";
      const match = linkHeader.match(/page=(\d+)>; rel="last"/);
      openPullRequests = match ? Number.parseInt(match[1], 10) : 1;
    }

    // Fetch recent issues for issue resolution time calculation
    let issueResolutionTime = 0;
    let meanResolutionDays = 0;
    let medianResolutionDays = 0;
    try {
      // Get the last 100 closed issues to analyze resolution time
      const closedIssuesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&sort=updated&direction=desc&per_page=100`,
        { headers }
      );

      if (closedIssuesResponse.ok) {
        const closedIssues = await closedIssuesResponse.json();

        if (Array.isArray(closedIssues) && closedIssues.length > 0) {
          // Calculate resolution times for all issues
          const resolutionTimes: number[] = [];

          for (const issue of closedIssues) {
            if (issue.pull_request) continue; // Skip PRs that appear in issues API

            const createdAt = new Date(issue.created_at).getTime();
            const closedAt = new Date(issue.closed_at).getTime();
            const resolutionTimeDays =
              (closedAt - createdAt) / (1000 * 60 * 60 * 24);

            if (resolutionTimeDays > 0) {
              resolutionTimes.push(resolutionTimeDays);
            }
          }

          if (resolutionTimes.length > 0) {
            // Calculate mean (average)
            meanResolutionDays =
              resolutionTimes.reduce((sum, time) => sum + time, 0) /
              resolutionTimes.length;

            // Calculate median
            resolutionTimes.sort((a, b) => a - b);
            const middle = Math.floor(resolutionTimes.length / 2);

            if (resolutionTimes.length % 2 === 0) {
              // Even number of elements, average the two middle values
              medianResolutionDays =
                (resolutionTimes[middle - 1] + resolutionTimes[middle]) / 2;
            } else {
              // Odd number of elements, take the middle value
              medianResolutionDays = resolutionTimes[middle];
            }

            // Use median for the score calculation
            // Convert to a 0-100 score (lower is better)
            // < 1 day = 100, 1 week = 70, 2 weeks = 50, 1 month = 30, > 2 months = 0
            if (medianResolutionDays < 1) {
              issueResolutionTime = 100;
            } else if (medianResolutionDays < 7) {
              issueResolutionTime = 100 - ((medianResolutionDays - 1) / 6) * 30; // 100 to 70
            } else if (medianResolutionDays < 14) {
              issueResolutionTime = 70 - ((medianResolutionDays - 7) / 7) * 20; // 70 to 50
            } else if (medianResolutionDays < 30) {
              issueResolutionTime =
                50 - ((medianResolutionDays - 14) / 16) * 20; // 50 to 30
            } else if (medianResolutionDays < 60) {
              issueResolutionTime =
                30 - ((medianResolutionDays - 30) / 30) * 30; // 30 to 0
            } else {
              issueResolutionTime = 0;
            }
          } else {
            // No valid issues to calculate from
            issueResolutionTime = 50; // Neutral score
          }
        } else {
          issueResolutionTime = 50; // Neutral score if no issues
        }
      }
    } catch (error) {
      console.error("Error fetching closed issues:", error);
      // Fallback to placeholder
      issueResolutionTime = Math.min(
        100,
        Math.round(50 + (repoData.stargazers_count / 10000) * 50)
      );
    }

    // Fetch recent PRs for PR review time calculation
    let prReviewTime = 0;
    let medianPRReviewDays = 0;
    let meanPRReviewDays = 0;
    try {
      const closedPRsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=50`,
        { headers }
      );

      if (closedPRsResponse.ok) {
        const closedPRs = await closedPRsResponse.json();

        if (Array.isArray(closedPRs) && closedPRs.length > 0) {
          // Calculate review times for all PRs
          const reviewTimes: number[] = [];

          for (const pr of closedPRs) {
            if (pr.merged_at) {
              const createdAt = new Date(pr.created_at).getTime();
              const mergedAt = new Date(pr.merged_at).getTime();
              const reviewTimeDays =
                (mergedAt - createdAt) / (1000 * 60 * 60 * 24);

              if (reviewTimeDays > 0) {
                reviewTimes.push(reviewTimeDays);
              }
            }
          }

          if (reviewTimes.length > 0) {
            // Calculate mean (average)
            meanPRReviewDays =
              reviewTimes.reduce((sum, time) => sum + time, 0) /
              reviewTimes.length;

            // Calculate median
            reviewTimes.sort((a, b) => a - b);
            const middle = Math.floor(reviewTimes.length / 2);

            if (reviewTimes.length % 2 === 0) {
              // Even number of elements, average the two middle values
              medianPRReviewDays =
                (reviewTimes[middle - 1] + reviewTimes[middle]) / 2;
            } else {
              // Odd number of elements, take the middle value
              medianPRReviewDays = reviewTimes[middle];
            }

            // Use median for the score calculation
            // Convert to a 0-100 score (lower is better)
            // < 1 day = 100, 3 days = 80, 1 week = 60, 2 weeks = 40, > 3 weeks = 0
            if (medianPRReviewDays < 1) {
              prReviewTime = 100;
            } else if (medianPRReviewDays < 3) {
              prReviewTime = 100 - ((medianPRReviewDays - 1) / 2) * 20; // 100 to 80
            } else if (medianPRReviewDays < 7) {
              prReviewTime = 80 - ((medianPRReviewDays - 3) / 4) * 20; // 80 to 60
            } else if (medianPRReviewDays < 14) {
              prReviewTime = 60 - ((medianPRReviewDays - 7) / 7) * 20; // 60 to 40
            } else if (medianPRReviewDays < 21) {
              prReviewTime = 40 - ((medianPRReviewDays - 14) / 7) * 40; // 40 to 0
            } else {
              prReviewTime = 0;
            }
          } else {
            // No valid PRs to calculate from
            prReviewTime = 50; // Neutral score
          }
        } else {
          prReviewTime = 50; // Neutral score if no PRs
        }
      }
    } catch (error) {
      console.error("Error fetching closed PRs:", error);
      // Fallback to placeholder
      prReviewTime = Math.min(
        100,
        Math.round(60 + (repoData.forks_count / 5000) * 40)
      );
    }

    // Calculate community engagement based on multiple factors
    const communityEngagement = calculateCommunityEngagement(
      repoData,
      contributorsCount,
      commitFrequency
    );

    // Calculate code quality based on multiple factors
    const codeQuality = calculateCodeQuality(repoData, weeklyCommits);

    // Calculate documentation quality
    const documentationQuality = calculateDocumentationQuality(repoData);

    // Calculate test coverage estimation
    const testCoverage = calculateTestCoverage(repoData);

    // Combine all data
    const repositoryDetails: RepositoryDetails = {
      ...repoData,
      contributors_count: contributorsCount,
      commit_frequency: commitFrequency,
      open_pull_requests: openPullRequests,
      issue_resolution_time: Math.round(issueResolutionTime),
      median_issue_resolution_days: Math.round(medianResolutionDays * 10) / 10, // Round to 1 decimal place
      mean_issue_resolution_days: Math.round(meanResolutionDays * 10) / 10, // Round to 1 decimal place
      pr_review_time: Math.round(prReviewTime),
      median_pr_review_days: Math.round(medianPRReviewDays * 10) / 10, // Round to 1 decimal place
      mean_pr_review_days: Math.round(meanPRReviewDays * 10) / 10, // Round to 1 decimal place
      community_engagement: Math.round(communityEngagement),
      code_quality: Math.round(codeQuality),
      documentation_quality: Math.round(documentationQuality),
      test_coverage: Math.round(testCoverage),
    };

    // Add rate limit information
    const rateLimitRemaining = repoResponse.headers.get(
      "X-RateLimit-Remaining"
    );
    const rateLimitLimit = repoResponse.headers.get("X-RateLimit-Limit");

    return new Response(
      JSON.stringify({
        ...repositoryDetails,
        _rateLimit: {
          remaining: rateLimitRemaining,
          limit: rateLimitLimit,
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GitHub API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch repository details" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Helper function to calculate community engagement score (0-100)
function calculateCommunityEngagement(
  repoData: any,
  contributorsCount: number,
  commitFrequency: number
): number {
  // Factors that indicate community engagement
  const starsNormalized = Math.min(1, repoData.stargazers_count / 10000) * 25; // Max 25 points for stars
  const forksNormalized = Math.min(1, repoData.forks_count / 2000) * 20; // Max 20 points for forks
  const watchersNormalized = Math.min(1, repoData.subscribers_count / 500) * 10; // Max 10 points for watchers
  const contributorsNormalized = Math.min(1, contributorsCount / 100) * 25; // Max 25 points for contributors
  const commitActivityNormalized = Math.min(1, commitFrequency / 50) * 20; // Max 20 points for commit activity

  // Calculate total score (max 100)
  const totalScore =
    starsNormalized +
    forksNormalized +
    watchersNormalized +
    contributorsNormalized +
    commitActivityNormalized;

  // Normalize to 0-100 scale
  return Math.min(100, totalScore);
}

// Helper function to calculate code quality score (0-100)
function calculateCodeQuality(repoData: any, weeklyCommits: number[]): number {
  // Base score starts at 50
  let score = 50;

  // Factors that might indicate code quality

  // 1. Consistent commit activity (vs. sporadic) - up to 15 points
  if (weeklyCommits.length >= 2) {
    const commitVariance = calculateVariance(weeklyCommits);
    const commitMean =
      weeklyCommits.reduce((sum, val) => sum + val, 0) / weeklyCommits.length;
    const coefficientOfVariation =
      commitMean > 0 ? commitVariance / commitMean : 0;

    // Lower coefficient of variation means more consistent commits
    score += Math.max(0, 15 - coefficientOfVariation * 10);
  }

  // 2. Age of repository (maturity) - up to 10 points
  const ageInMonths =
    (new Date().getTime() - new Date(repoData.created_at).getTime()) /
    (1000 * 60 * 60 * 24 * 30);
  score += Math.min(10, ageInMonths / 6); // Max 10 points for repos 5+ years old

  // 3. Issues to forks ratio (lower is better) - up to 10 points
  const issuesForksRatio =
    repoData.forks_count > 0
      ? repoData.open_issues_count / repoData.forks_count
      : 0;
  score += Math.max(0, 10 - issuesForksRatio * 2);

  // 4. Stars (community validation) - up to 15 points
  score += Math.min(15, (repoData.stargazers_count / 5000) * 15);

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, score));
}

// Helper function to calculate documentation quality score (0-100)
function calculateDocumentationQuality(repoData: any): number {
  // Base score starts at 40
  let score = 40;

  // Factors that might indicate documentation quality

  // 1. Has wiki - 10 points
  if (repoData.has_wiki) {
    score += 10;
  }

  // 2. Has description - up to 10 points
  if (repoData.description) {
    score += Math.min(10, repoData.description.length / 20);
  }

  // 3. Has website - 10 points
  if (repoData.homepage && repoData.homepage.length > 0) {
    score += 10;
  }

  // 4. Has README (assumed yes, but size matters) - up to 15 points
  // We don't have direct access to README content, so we estimate based on repo size
  score += Math.min(15, (repoData.size / 10000) * 5);

  // 5. Stars (community validation) - up to 15 points
  score += Math.min(15, (repoData.stargazers_count / 5000) * 15);

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, score));
}

// Helper function to calculate test coverage estimation (0-100)
function calculateTestCoverage(repoData: any): number {
  // This is a very rough estimation since we can't directly access test files
  // Base score starts at 30
  let score = 30;

  // Factors that might indicate test coverage

  // 1. Repository size (larger repos tend to have more tests) - up to 20 points
  score += Math.min(20, (repoData.size / 50000) * 20);

  // 2. Age of repository (maturity) - up to 15 points
  const ageInMonths =
    (new Date().getTime() - new Date(repoData.created_at).getTime()) /
    (1000 * 60 * 60 * 24 * 30);
  score += Math.min(15, ageInMonths / 12);

  // 3. Stars (community validation) - up to 20 points
  score += Math.min(20, (repoData.stargazers_count / 5000) * 20);

  // 4. Forks (more forks often means more testing) - up to 15 points
  score += Math.min(15, (repoData.forks_count / 1000) * 15);

  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, score));
}

// Helper function to calculate variance of an array
function calculateVariance(array: number[]): number {
  if (array.length === 0) return 0;

  const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
  const squaredDifferences = array.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDifferences.reduce((sum, val) => sum + val, 0) / array.length;

  return variance;
}
