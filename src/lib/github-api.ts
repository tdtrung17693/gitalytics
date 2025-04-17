export type Repository = {
  id: number
  name: string
  owner: {
    login: string
    avatar_url?: string
  }
  description: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  language: string | null
  license?: {
    name: string
  } | null
  updated_at: string
  created_at: string
  topics?: string[]
  html_url: string
}

export type RepositoryDetails = Repository & {
  contributors_count: number
  commit_frequency: number
  open_pull_requests?: number
  issue_resolution_time: number // 0-100 score (higher is better)
  median_issue_resolution_days?: number // Median days to resolve issues
  mean_issue_resolution_days?: number // Mean (average) days to resolve issues
  pr_review_time: number // 0-100 score (higher is better)
  median_pr_review_days?: number // Median days to review PRs
  mean_pr_review_days?: number // Mean (average) days to review PRs
  community_engagement: number // 0-100 score
  code_quality: number // 0-100 score
  documentation_quality: number // 0-100 score
  test_coverage: number // 0-100 score
  _rateLimit?: {
    remaining: string | null
    limit: string | null
  }
}

export type SearchResponse = {
  total_count: number
  incomplete_results: boolean
  items: Repository[]
  _rateLimit?: {
    remaining: string | null
    limit: string | null
  }
}

export async function searchRepositories(query: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`/api/github?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to search repositories")
    }

    const data: SearchResponse = await response.json()
    return data
  } catch (error) {
    console.error("Error searching repositories:", error)
    throw error
  }
}

export async function getRepositoryDetails(owner: string, repo: string): Promise<RepositoryDetails> {
  try {
    const response = await fetch(`/api/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to get repository details")
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting repository details:", error)
    throw error
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return "today"
  } else if (diffDays === 1) {
    return "yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }
}
