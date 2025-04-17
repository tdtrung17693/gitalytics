import type { APIRoute } from "astro";

export const prerender = false;
export const GET: APIRoute = async (props) => {
  const { url } = props;
  const { searchParams } = url;
  const query = searchParams.get("query");

  if (!query) {
    return new Response(
      JSON.stringify({ error: "Query parameter is required" }),
      { status: 400 }
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
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}&sort=stars&order=desc&per_page=10`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ error: error.message }), {
        status: response.status,
      });
    }

    const data = await response.json();

    // Add rate limit information to the response
    const rateLimitRemaining = response.headers.get("X-RateLimit-Remaining");
    const rateLimitLimit = response.headers.get("X-RateLimit-Limit");

    return new Response(
      JSON.stringify({
        ...data,
        _rateLimit: {
          remaining: rateLimitRemaining,
          limit: rateLimitLimit,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GitHub API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from GitHub API" }),
      { status: 500 }
    );
  }
};
