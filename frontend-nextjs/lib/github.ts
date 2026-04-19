export async function fetchGitHubUser(token: string) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`GitHub user fetch failed: ${payload}`);
  }

  return response.json();
}
